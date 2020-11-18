<script lang="typescript">
  import SpotForm from "./spot-form.svelte";
  import Spot from "./spot.svelte";

  import { replace } from "svelte-spa-router";
  import { fade } from "svelte/transition";

  import { EventBusSingleton as EventBus } from "light-event-bus";

  import { myPublicKey, mySecretKey } from "../../common/crypto";
  import { dbrest } from "../../common/firebase";
  import { initPeerKey, peerConnectionCleanup, setupPeerConnection, allSpotsInSync } from "./common";
  import { _roomId$, roomId$, _playerId$, playerId$, spots$, wizard$, gamen$ } from "../../common/datastore";
  import * as global from "../../common/dataglobal";
  import * as msgbus from "../../common/msgbus";
  import * as wizard from "../../common/wizard";
  import * as utils from "../../common/utils";
  import * as errors from "../../common/errors";

  export let params: any = {};

  $: if (wizard.isAfter($wizard$, wizard.steps.WAIT_FOR_SPOTS)) {
    if ($playerId$ == "host") {
      replace(`/game/create/${$roomId$}`);
    } else {
      replace(`/game/join/${$roomId$}`);
    }
  } else if ($_roomId$ && $_playerId$) {
    if ($_playerId$ == "host") {
      if (params.id != $_roomId$) {
        replace(`/room/create/${$_roomId$}`);
      }
    } else {
      replace(`/room/join/${$_roomId$}`);
    }
  } else if (params.id) {
    replace("/room/create");
  }

  async function createRoomSpace() {
    try {
      $wizard$ = wizard.next($wizard$);
      $_playerId$ = "host";
      $_roomId$ = "1234";

      let response = await dbrest("rooms.json", {
        method: "POST",
        body: JSON.stringify({
          createdAt: { ".sv": "timestamp" },
          status: "open",
          players: {
            host: { publicKey: myPublicKey },
          },
        }),
      });
      if (!response.ok) {
        console.log(response.status);
        return errors.fatal(errors.fatalEnum.FIRESTORE_ERROR);
      }
      let json = await response.json();
      $_roomId$ = json.name;
      
      global.players[$_playerId$] = { publicKey: myPublicKey };

      $playerId$ = $_playerId$;
      $roomId$ = $_roomId$;
      $wizard$ = wizard.next($wizard$);
    } catch (err) {
      console.log(err);
      return errors.fatal(errors.fatalEnum.UNEXPECTED);
    }
  }

  let _spotName: string = "";
  let _spotAvatar: string = "";
  let _spotTeam: string = "";
  let _spotErrors: string[] = [];

  function markYourSpot() {
    $wizard$ = wizard.next($wizard$);

    _spotErrors = [];
    if (!_spotName) {
      _spotErrors = ["Name is required.", ..._spotErrors];
    }
    if (!_spotAvatar) {
      _spotErrors = ["Avatar is required.", ..._spotErrors];
    }
    if (!_spotTeam) {
      _spotErrors = ["Team is required.", ..._spotErrors];
    }
    if (_spotErrors.length) {
      $wizard$ = wizard.back($wizard$);
      return;
    }

    $spots$ = {
      [$playerId$]: {
        name: _spotName,
        avatar: _spotAvatar,
        team: _spotTeam,
      },
    };

    $wizard$ = wizard.next($wizard$);

    msgbus.firestoreListen($roomId$, $playerId$, mySecretKey);

    waitForSpots();
  }

  if (wizard.isIn($wizard$, wizard.steps.WAIT_FOR_SPOTS, "todo")) waitForSpots();
  function waitForSpots() {
    $wizard$ = wizard.next($wizard$);
    dbrest(`rooms/${$roomId$}/status.json`, { method: "PUT", body: '"open"' });

    EventBus.publish("roomChatMsg", {
      from: "internal",
      data: "Waiting for players to start a new game.",
    });

    $spots$[$playerId$]["wizard"] = $wizard$;
    $spots$[$playerId$]["gamen"] = $gamen$ + 1;
    $spots$ = $spots$;

    msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "updateSpots", $spots$);
    EventBus.publish("updatedSpots");
  }
</script>

<style>
  .loading:after {
    overflow: hidden;
    position: absolute;
    display: inline-block;
    vertical-align: bottom;
    animation: ellipsis steps(4, end) 900ms infinite;
    content: "\2026"; /* ascii code for the ellipsis character */
    width: 0px;
  }

  @keyframes ellipsis {
    to {
      width: 1.25em;
    }
  }

  .inactive {
    @apply opacity-50;
  }

  td {
    @apply align-top;
    @apply px-2;
    @apply py-2;
    @apply text-4xl;
  }
</style>

<div class="w-full flex flex-col left-0 bg-white items-center justify-center" style="min-height: calc(100vh - 5rem);">
  <table>
    <tr class:inactive="{wizard.isBefore($wizard$, wizard.steps.CREATE_OR_JOIN_ROOM_SPACE)}">
      <td>
        {#if wizard.isAfter($wizard$, wizard.steps.CREATE_OR_JOIN_ROOM_SPACE)}&#x2611;{:else}&#x2610;{/if}
      </td>
      {#if wizard.isBefore($wizard$, wizard.steps.CREATE_OR_JOIN_ROOM_SPACE)}
        <td in:fade>Create a room</td>
      {:else if wizard.isIn($wizard$, wizard.steps.CREATE_OR_JOIN_ROOM_SPACE, 'todo')}
        <td in:fade>
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white px-3 rounded-lg focus:outline-none"
            on:click="{createRoomSpace}"
          >
            Create a room
          </button>
        </td>
      {:else if wizard.isIn($wizard$, wizard.steps.CREATE_OR_JOIN_ROOM_SPACE, 'doing')}
        <td in:fade>
          <span class="loading">Creating a room</span>
        </td>
      {:else if wizard.isAfter($wizard$, wizard.steps.CREATE_OR_JOIN_ROOM_SPACE)}
        <td in:fade>
          Created room
          <ul class="text-base text-gray-700">
            <li>
              Room ID:
              <code>{$roomId$}</code>
            </li>
          </ul>
        </td>
      {/if}
    </tr>
    <tr class:inactive="{wizard.isBefore($wizard$, wizard.steps.SAVE_SPOT)}">
      <td>
        {#if wizard.isAfter($wizard$, wizard.steps.SAVE_SPOT)}&#x2611;{:else}&#x2610;{/if}
      </td>
      {#if wizard.isBefore($wizard$, wizard.steps.SAVE_SPOT)}
        <td in:fade>Mark your spot</td>
      {:else if wizard.isIn($wizard$, wizard.steps.SAVE_SPOT)}
        <td in:fade>
          <div class:loading="{wizard.isIn($wizard$, wizard.steps.SAVE_SPOT, 'doing')}">Mark your spot</div>
          <SpotForm
            readonly="{wizard.isIn($wizard$, wizard.steps.SAVE_SPOT, 'doing')}"
            bind:name="{_spotName}"
            bind:avatar="{_spotAvatar}"
            bind:team="{_spotTeam}"
            bind:errors="{_spotErrors}"
          >
            <div class="w-full">
              <button
                class="{wizard.isIn($wizard$, wizard.steps.SAVE_SPOT, 'doing') ? 'bg-gray-700' : 'bg-blue-500 hover:bg-blue-600'}
                text-white text-xl px-4 focus:outline-none rounded-lg"
                disabled="{wizard.isIn($wizard$, wizard.steps.SAVE_SPOT, 'doing')}"
                on:click="{markYourSpot}"
              >
                Mark my spot
              </button>
            </div>
          </SpotForm>
        </td>
      {:else if wizard.isAfter($wizard$, wizard.steps.SAVE_SPOT)}
        <td in:fade>
          <div>Marked your spot</div>
          <SpotForm
            readonly="{true}"
            name="{utils.getAttr($spots$, [$playerId$, 'name'])}"
            avatar="{utils.getAttr($spots$, [$playerId$, 'avatar'])}"
            team="{utils.getAttr($spots$, [$playerId$, 'team'])}"
          />
        </td>
      {/if}
    </tr>
    <tr class:inactive="{wizard.isBefore($wizard$, wizard.steps.WAIT_FOR_SPOTS)}">
      <td>
        {#if wizard.isAfter($wizard$, wizard.steps.WAIT_FOR_SPOTS)}&#x2611;{:else}&#x2610;{/if}
      </td>
      {#if Object.keys($spots$).length == 0}
        <td>Wait for others</td>
      {:else}
        <td in:fade>
          <div class:loading="{wizard.isIn($wizard$, wizard.steps.WAIT_FOR_SPOTS, 'doing')}">Waiting for others</div>
          <div class="w-full text-base">
            {#if wizard.isIn($wizard$, wizard.steps.WAIT_FOR_SPOTS)}
              <div in:fade class="mb-4">
                <span class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">
                  Copy and share this invitation link
                </span>
                <input
                  value="{`${window.location.origin}/#/room/join/${$roomId$}`}"
                  readonly="{true}"
                  class="appearance-none block w-full bg-gray-200 text-gray-700 text-sm border border-gray-200 rounded
                  p-1 font-mono leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="text"
                  on:click="{(e) => {
                    e.target.focus();
                    e.target.select();
                  }}"
                />
              </div>
            {/if}
            <span class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">
              Spots reserved in room
            </span>
            {#if Object.keys($spots$).length < 4}
              <div out:fade class="text-base text-gray-700 mb-1">
                Need {4 - Object.keys($spots$).length} more player(s)
              </div>
            {/if}
            <ul class="text-base">
              {#each Object.keys($spots$).sort() as pid}
                <li in:fade class="flex items-center mb-2">
                  <Spot
                    name="{utils.getAttr($spots$, [pid, 'name'])}"
                    avatar="{utils.getAttr($spots$, [pid, 'avatar'])}"
                    team="{utils.getAttr($spots$, [pid, 'team'])}"
                  />
                  {#if utils.getAttr($spots$, [pid, 'gamen']) == $gamen$ + 1}
                    <span class="text-xs inline-block bg-green-200 rounded-sm px-2 py-1 ml-2">in sync</span>
                  {/if}
                  {#if pid != $playerId$}
                    <button
                      class="bg-blue-500 hover:bg-blue-700 text-white text-xs px-2 py-1 ml-2 rounded-sm
                      focus:outline-none"
                      on:click="{() => peerConnectionCleanup(global.players, pid)}"
                    >
                      kick
                    </button>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        </td>
      {/if}
    </tr>
  </table>
</div>
