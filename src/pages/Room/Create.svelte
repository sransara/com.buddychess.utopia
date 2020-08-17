<script lang="typescript">
  import Sidebar from "../../components/Sidebar.svelte";
  import SpotForm from "./spot-form.svelte";
  import Spot from "./spot.svelte";
  import { push, replace, link } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import { myPublicKey, mySecretKey } from "../../common/crypto";
  import { dbrest } from "../../common/firebase";
  import { firestoreMsgBusListen, msgBusSend } from "../../common/msgbus";
  import { EventBusSingleton as EventBus } from "light-event-bus";
  import { roomId, _roomId, playerId, _playerId, roomWizard, spots } from "../../common/datastore";
  import { players } from "../../common/dataglobal";
  import { wizardNextStep, wizardBackStep, getattr, validatePlayer, setupPeerConnection } from "./common";
  import App from "../../App.svelte";
  import BuddyChessground from "../../components/BuddyChessground.svelte";

  export let params: any = {};
  $: if ($_roomId && $_playerId) {
    if ($_playerId == "host") {
      if (params.id != $_roomId) {
        replace(`/room/create/${$_roomId}`);
      }
    } else {
      replace(`/room/join/${$_roomId}`);
    }
  } else if (params.id) {
    replace("/room/create");
  }

  async function createRoomSpace() {
    try {
      $roomWizard = wizardNextStep($roomWizard);
      $_playerId = "host";
      $_roomId = "1234";

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
      if (!response.ok) throw new Error(`${response.status}`);
      let json = await response.json();
      $_roomId = json.name;

      players[$_playerId] = { publicKey: myPublicKey };

      $playerId = $_playerId;
      $roomId = $_roomId;
      $roomWizard = wizardNextStep($roomWizard);
    } catch (err) {
      console.log(err);
    }
  }

  let _spotName: string = "";
  let _spotAvatar: string = "";
  let _spotTeam: string = "";
  let _spotErrors: string[] = [];

  function markYourSpot() {
    $roomWizard = wizardNextStep($roomWizard);

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
      $roomWizard = wizardBackStep($roomWizard);
      return;
    }

    $spots = {
      [$playerId]: {
        name: _spotName,
        avatar: _spotAvatar,
        team: _spotTeam,
      },
    };

    $roomWizard = wizardNextStep($roomWizard);
    hiddenStep();
  }

  function hiddenStep() {
    $roomWizard = wizardNextStep($roomWizard);

    EventBus.subscribe("initPeerConnection", async (arg: any) => {
      const peerId = arg.from;
      await validatePlayer(players, $_roomId, peerId);
      if (players[peerId] && players[peerId]["peerConnection"]) return;
      await setupPeerConnection(players, $roomId, $playerId, peerId);
    });

    firestoreMsgBusListen($roomId, $playerId, mySecretKey);

    EventBus.subscribe("saveSpot", (arg: any) => {
      const peerId = arg.from;
      const spot = arg.payload;
      let errors: string[] = [];
      const spotskeys = Object.keys($spots).filter((pid: string) => pid != peerId);
      if (spotskeys.filter((pid: string) => $spots[pid]["team"] == spot["team"]).length >= 2) {
        errors = [`Sorry, team ${spot["team"]} is full at the moment.`];
      }
      if (spotskeys.length >= 4) {
        errors = ["Sorry, this room is full at the moment."];
      }
      if (!errors.length) {
        $spots = { ...$spots, ...{ [peerId]: spot } };
      }
      msgBusSend(players, $roomId, $playerId, peerId, "saveSpotAck", { errors: errors, spots: $spots });
    });

    EventBus.subscribe("updateSpot", (arg: any) => {
      const peerId: string = arg.from as string;
      $spots = { ...$spots, ...{ [peerId]: arg.payload } };
      Object.keys($spots).forEach((pid) => {
        if (pid == $playerId) return;
        msgBusSend(players, $roomId, $playerId, pid, "updateSpots", $spots);
      });
    });

    EventBus.subscribe("deletePlayer", (pid: any) => {
      if (pid in $spots) {
        delete $spots[pid];
        $spots = $spots;
        Object.keys($spots).forEach((pid) => {
          if (pid == $playerId) return;
          msgBusSend(players, $roomId, $playerId, pid, "updateSpots", $spots);
        });
      }
    });

    $roomWizard = wizardNextStep($roomWizard);
    imReady();
  }

  if ($roomWizard.currStep == 4 && $roomWizard.currStepStatus == "todo") imReady();
  function imReady() {
    $roomWizard = wizardNextStep($roomWizard);

    Object.keys($spots).forEach((pid) => {
      $spots[pid]["ready"] = pid == $playerId;
    });
  }
</script>

<style>
  .loading:after {
    overflow: hidden;
    position: fixed;
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

<div class="w-full h-full flex">
  <div class="inline-block py-1 pl-2 w-4/5">
    <div class="w-full h-full flex flex-col left-0 bg-white items-center justify-center">
      <table>
        <tr class:inactive="{1 > $roomWizard.currStep}">
          <td>
            {#if 1 < $roomWizard.currStep}&#x2611;{:else}&#x2610;{/if}
          </td>
          {#if 1 > $roomWizard.currStep}
            <td in:fade>Create a room</td>
          {:else if 1 == $roomWizard.currStep && 'todo' == $roomWizard.currStepStatus}
            <td in:fade>
              <button
                class="bg-blue-500 hover:bg-blue-700 text-white px-3 rounded-lg focus:outline-none"
                on:click="{createRoomSpace}"
              >
                Create a room
              </button>
            </td>
          {:else if 1 == $roomWizard.currStep && 'doing' == $roomWizard.currStepStatus}
            <td in:fade>
              <span class="loading">Creating a room</span>
            </td>
          {:else if 1 < $roomWizard.currStep}
            <td in:fade>
              Created room
              <ul class="text-base text-gray-700">
                <li>
                  Room ID:
                  <code>{$roomId}</code>
                </li>
              </ul>
            </td>
          {/if}
        </tr>
        <tr class:inactive="{2 > $roomWizard.currStep}">
          <td>
            {#if 2 < $roomWizard.currStep}&#x2611;{:else}&#x2610;{/if}
          </td>
          {#if 2 > $roomWizard.currStep}
            <td in:fade>Mark your spot</td>
          {:else if 2 == $roomWizard.currStep}
            <td in:fade>
              <div class:loading="{$roomWizard.currStepStatus == 'doing'}">Mark your spot</div>
              <SpotForm
                readonly="{$roomWizard.currStepStatus == 'doing'}"
                bind:name="{_spotName}"
                bind:avatar="{_spotAvatar}"
                bind:team="{_spotTeam}"
                bind:errors="{_spotErrors}"
              >
                <div class="w-full">
                  <button
                    class="{$roomWizard.currStepStatus == 'doing' ? 'bg-gray-700' : 'bg-blue-500 hover:bg-blue-600'}
                    text-white text-xl px-4 focus:outline-none rounded-lg"
                    disabled="{$roomWizard.currStepStatus == 'doing'}"
                    on:click="{markYourSpot}"
                  >
                    Mark my spot
                  </button>
                </div>
              </SpotForm>
            </td>
          {:else if 2 < $roomWizard.currStep}
            <td in:fade>
              <div>Marked your spot</div>
              <SpotForm
                readonly="{true}"
                name="{getattr($spots, [$playerId, 'name'])}"
                avatar="{getattr($spots, [$playerId, 'avatar'])}"
                team="{getattr($spots, [$playerId, 'team'])}"
              />
            </td>
          {/if}
        </tr>
        <tr class:inactive="{4 > $roomWizard.currStep}">
          <td>
            {#if 4 < $roomWizard.currStep}&#x2611;{:else}&#x2610;{/if}
          </td>
          {#if Object.keys($spots).length == 0}
            <td>Wait for others</td>
          {:else}
            <td in:fade>
              <div class:loading="{4 == $roomWizard.currStep && $roomWizard.currStepStatus == 'doing'}">
                Waiting for others
              </div>
              <div class="w-full text-base">
                {#if 4 == $roomWizard.currStep}
                  <div in:fade class="mb-4">
                    <span class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">
                      Invitation link
                    </span>
                    <input
                      value="{`${window.location.origin}/#/room/join/${$roomId}`}"
                      readonly="{true}"
                      class="appearance-none block w-full bg-gray-200 text-gray-700 text-sm border border-gray-200
                      rounded p-1 font-mono leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      type="text"
                      on:click="{(e) => {
                        e.target.select();
                      }}"
                    />
                  </div>
                {/if}
                <span class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">
                  Spots reserved in room
                </span>
                {#if Object.keys($spots).length < 4}
                  <div out:fade class="text-base text-gray-700 mb-1">
                    Need {4 - Object.keys($spots).length} more player(s)
                  </div>
                {/if}
                <ul class="text-base">
                  {#each Object.keys($spots).sort() as pid}
                    <li in:fade class="flex items-center mb-2">
                      <Spot
                        name="{getattr($spots, [pid, 'name'])}"
                        avatar="{getattr($spots, [pid, 'avatar'])}"
                        team="{getattr($spots, [pid, 'team'])}"
                      />
                      {#if getattr($spots, [pid, 'ready'])}
                        <span class="text-xs inline-block bg-green-200 rounded-sm px-2 py-1 ml-2">ready</span>
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
  </div>
  <Sidebar>
    <div class="flex-grow container border border-gray-400">
      <div class="p-1 bg-gray-800 text-gray-200 whitespace-no-wrap">Room chat</div>
      <div></div>
    </div>
  </Sidebar>
</div>
