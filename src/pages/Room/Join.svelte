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

  export let params: any = {};

  type stepStatus = "later" | "nextup" | "doing" | "done";
  let stepCreateRoom: stepStatus;
  let stepSetupProfile: stepStatus = "nextup";
  let stepWaitForOtherPlayers: stepStatus;
  $: stepCreateRoom = $roomId ? "done" : "nextup";
  // $: stepSetupProfile = stepCreateRoom == "done" ? "doing" : "later";
  $: stepWaitForOtherPlayers = stepSetupProfile == "done" ? "nextup" : "later";

  $: if ($_roomId && $_playerId) {
    if ($_playerId == "host") {
      replace(`/room/create/${$_roomId}`);
    } else {
      if (params.id != $_roomId) {
        replace(`/room/join/${$_roomId}`);
      }
    }
  }
  async function joinRoomQueue() {
    try {
      $roomWizard = wizardNextStep($roomWizard);
      $_playerId = "12345";
      $_roomId = params.id;

      let response, json;

      response = await dbrest(`rooms/${params.id}.json`);
      if (!response.ok) throw new Error(`${response.status}`);
      json = await response.json();
      if (!json) throw new Error("Room not found.");
      if (json.status != "open") throw new Error("Room is not open.");
      $_roomId = params.id as string;
      Object.assign(players, json.players);

      response = await dbrest(`rooms/${$_roomId}/players.json`, {
        method: "POST",
        body: JSON.stringify({ publicKey: myPublicKey }),
      });
      if (!response.ok) throw new Error(`${response.status}`);
      json = await response.json();
      $_playerId = json.name as string;

      players[$_playerId] = { publicKey: myPublicKey };

      firestoreMsgBusListen($_roomId, $_playerId, mySecretKey);

      await validatePlayer(players, $_roomId, "host");
      await setupPeerConnection(players, $_roomId, $_playerId, "host");

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

  async function markYourSpot() {
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

    const spot: any = {
      name: _spotName,
      avatar: _spotAvatar,
      team: _spotTeam,
    };

    msgBusSend(players, $roomId, $playerId, "host", "saveSpot", spot);
    const response: any = await new Promise((resolve) => {
      let subscription: any;
      subscription = EventBus.subscribe("saveSpotAck", (arg: any) => {
        subscription.unsubscribe();
        resolve(arg.payload);
      });
    });
    _spotErrors = response.errors;
    $spots = response.spots;

    if (_spotErrors.length) {
      $roomWizard = wizardBackStep($roomWizard);
      return;
    }

    $roomWizard = wizardNextStep($roomWizard);
    hiddenStep();
  }

  function hiddenStep() {
    $roomWizard = wizardNextStep($roomWizard);

    EventBus.subscribe("initPeerConnection", async (arg: any) => {
      const peerId = arg.from;
      if (players[peerId] && players[peerId]["peerConnection"]) return;
      await setupPeerConnection(players, $roomId, $playerId, peerId);
    });

    EventBus.subscribe("updateSpots", async (arg: any) => {
      $spots = arg.payload;
      Object.keys($spots).forEach(async (peerId) => {
        if (peerId == $playerId) return;
        if ($playerId < peerId) return;
        // only non-polite will initiate connection
        if (players[peerId] && players[peerId]["peerConnection"]) return;
        await setupPeerConnection(players, $roomId, $playerId, peerId);
      });
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
    msgBusSend(players, $roomId, $playerId, "host", "updateSpot", $spots[$playerId]);
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
            <td in:fade>
              Join room queue
              <p class="text-base text-gray-700">
                Room ID:
                <code>{params.id}</code>
              </p>
            </td>
          {:else if 1 == $roomWizard.currStep && 'todo' == $roomWizard.currStepStatus}
            <td in:fade>
              <button
                class="bg-blue-500 hover:bg-blue-700 text-white px-3 rounded-lg focus:outline-none"
                on:click="{joinRoomQueue}"
              >
                Join room queue
              </button>
              <p class="text-base text-gray-700">
                Room ID:
                <code>{params.id}</code>
              </p>
            </td>
          {:else if 1 == $roomWizard.currStep && 'doing' == $roomWizard.currStepStatus}
            <td in:fade>
              <span class="loading">Joining room queue</span>
              <p class="text-base text-gray-700">
                Room ID:
                <code>{params.id}</code>
              </p>
            </td>
          {:else if 1 < $roomWizard.currStep}
            <td in:fade>
              Joined room queue
              <p class="text-base text-gray-700">
                Room ID:
                <code>{params.id}</code>
              </p>
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
