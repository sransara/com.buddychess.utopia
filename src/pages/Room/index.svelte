<script lang="typescript">
  import Sidebar from "../../components/Sidebar.svelte";
  import { push, replace, link } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import { dbrest } from "../../common/firebase";
  import { encrypt, decrypt, myPublicKey, mySecretKey } from "../../common/crypto";
  import * as firebase from "firebase/app";
  import { EventBusSingleton } from "light-event-bus";

  const firestore = firebase.firestore();

  export let params: any = {};
  let roomId: string = "";
  let playerId: string = "";
  let fsmsgSubscription: any;
  $: if (roomId && playerId) {
    fsmsgSubscription = firestore
      .collection("rooms")
      .doc(roomId)
      .collection("msgs")
      .where("to", "==", playerId)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            const data = change.doc.data();
            EventBusSingleton.publish(data.method, data);
          }
        });
      });
  }

  type stepStatus = "later" | "nextup" | "doing" | "done";
  let stepCreateRoom: stepStatus = roomId ? "done" : "nextup";
  let stepSetupProfile: stepStatus = stepCreateRoom == "done" ? "nextup" : "later";
  let stepWaitForOtherPlayers: stepStatus = "later";

  $: if (roomId && params.id && roomId != params.id) {
    window.location.reload();
  }

  const configuration = {
    iceServers: [
      {
        urls: ["stun:stun1.l.google.com:19302", "stun:global.stun.twilio.com:3478?transport=udp"],
      },
    ],
    iceCandidatePoolSize: 5,
  };

  function registerPeerConnectionListeners(peerConnection: any) {
    peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener("signalingstatechange", () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
  }

  async function createRoom() {
    try {
      stepCreateRoom = "doing";
      playerId = "host";

      let response = await dbrest("rooms.json", {
        method: "POST",
        body: JSON.stringify({
          createdAt: { ".sv": "timestamp" },
          players: {
            host: { publicKey: myPublicKey },
          },
        }),
      });
      if (!response.ok) throw new Error(`${response.status}`);
      let json = await response.json();
      roomId = json.name;

      EventBusSingleton.subscribe("callerWithSessionDescription", async function (arg: any) {
        const callerPlayerId = arg.from;

        const response = await dbrest(`rooms/${roomId}/players/${callerPlayerId}.json`);
        if (!response.ok) return;
        const json = await response.json();
        const callerPublicKey = json["publicKey"];

        const peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners(peerConnection);

        peerConnection.addEventListener("icecandidate", (event) => {
          if (!event.candidate) {
            return;
          }
          firestore
            .collection("rooms")
            .doc(roomId)
            .collection("msgs")
            .add({
              from: "host",
              to: callerPlayerId,
              method: "addCalleeIceCandidate",
              payload: encrypt(callerPublicKey, event.candidate),
            });
        });

        const payload = decrypt(mySecretKey, arg.payload);

        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        const sessionDescription = {
          type: answer.type,
          sdp: answer.sdp,
        };

        firestore
          .collection("rooms")
          .doc(roomId)
          .collection("msgs")
          .add({
            from: "host",
            to: callerPlayerId,
            method: "calleeWithSessionDescription",
            payload: encrypt(callerPublicKey, sessionDescription),
          });

        EventBusSingleton.subscribe("addCallerIceCandidate", async function (arg: any) {
          if (arg.from != callerPlayerId) return;
          const payload = decrypt(mySecretKey, arg.payload);
          await peerConnection.addIceCandidate(new RTCIceCandidate(payload));
        });

        const dataChannel = peerConnection.createDataChannel("msgbus", { negotiated: true, id: 0 });
        dataChannel.onopen = function (event) {
          console.log("Callee sending Hi");
          dataChannel.send("Hi!");
        };
        dataChannel.onmessage = function (event) {
          console.log(event.data);
        };
      });

      stepCreateRoom = "done";
    } catch (err) {
      console.log(err);
      replace("/room");
    }
  }

  async function joinRoom() {
    try {
      stepCreateRoom = "doing";

      let response, json;
      response = await dbrest(`rooms/${params.id}.json`);
      if (!response.ok) throw new Error(`${response.status}`);
      json = await response.json();
      if (!json) throw new Error("Room not found.");
      roomId = params.id;
      const hostPublicKey = json["players"]["host"]["publicKey"];

      response = await dbrest(`rooms/${roomId}/players.json`, {
        method: "POST",
        body: JSON.stringify({ publicKey: myPublicKey }),
      });
      if (!response.ok) throw new Error(`${response.status}`);
      json = await response.json();
      playerId = json.name;

      const peerConnection = new RTCPeerConnection(configuration);
      registerPeerConnectionListeners(peerConnection);

      peerConnection.addEventListener("negotiationneeded", async (event) => {
        const offer = await peerConnection.createOffer();
        if (peerConnection.signalingState != "stable") return;
        await peerConnection.setLocalDescription(offer);
        const sessionDescription = {
          type: offer.type,
          sdp: offer.sdp,
        };

        firestore
          .collection("rooms")
          .doc(roomId)
          .collection("msgs")
          .add({
            from: playerId,
            to: "host",
            method: "callerWithSessionDescription",
            payload: encrypt(hostPublicKey, sessionDescription),
          });
      });

      peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) {
          return;
        }
        firestore
          .collection("rooms")
          .doc(roomId)
          .collection("msgs")
          .add({
            from: playerId,
            to: "host",
            method: "addCallerIceCandidate",
            payload: encrypt(hostPublicKey, event.candidate),
          });
      });

      EventBusSingleton.subscribe("calleeWithSessionDescription", async (arg: any) => {
        if (arg.from != "host") return;
        const payload = decrypt(mySecretKey, arg.payload);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
      });

      EventBusSingleton.subscribe("addCalleeIceCandidate", async (arg: any) => {
        if (arg.from != "host") return;
        const payload = decrypt(mySecretKey, arg.payload);
        await peerConnection.addIceCandidate(new RTCIceCandidate(payload));
      });

      const dataChannel = peerConnection.createDataChannel("msgbus", { negotiated: true, id: 0 });
      dataChannel.onopen = function (event) {
        console.log("Caller sending Hi");
        dataChannel.send("Hi!");
      };
      dataChannel.onmessage = function (event) {
        console.log(event.data);
      };

      stepCreateRoom = "done";
    } catch (err) {
      console.log(err);
    }
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

  td {
    @apply align-top;
    @apply px-4;
    @apply text-5xl;
  }
</style>

<div class="w-full h-full flex">
  <div class="inline-block py-1 pl-2 w-4/5">
    <div out:fade class="w-full h-full flex flex-col left-0 bg-white items-center justify-center">
      <table>
        <tr class="{stepCreateRoom == 'later' ? 'text-gray-500' : ''}">
          {#if stepCreateRoom == 'nextup'}
            <td>&#x2610;</td>
            <td class="align-middle" in:fade>
              {#if params.id}
                <button class="bg-blue-500 hover:bg-blue-700 text-white px-6 rounded-lg" on:click="{joinRoom}">
                  Join room
                </button>
                <ul class="text-3xl">
                  <li>
                    Room ID:
                    <code>{params.id}</code>
                  </li>
                </ul>
              {:else}
                <button class="bg-blue-500 hover:bg-blue-700 text-white px-6 rounded-lg" on:click="{createRoom}">
                  Create room
                </button>
              {/if}
            </td>
          {:else if stepCreateRoom == 'doing'}
            <td>&#x2610;</td>
            <td class="align-middle" in:fade>
              {#if params.id}
                <span class="loading">Joining room</span>
                <ul class="text-3xl">
                  <li>
                    Room ID:
                    <code>{params.id}</code>
                  </li>
                  <li class="loading">Connecting to the host</li>
                </ul>
              {:else}
                <span class="loading">Creating room</span>
              {/if}
            </td>
          {:else if stepCreateRoom == 'done'}
            <td>&#x2611;</td>
            <td class="align-middle" in:fade>
              {#if playerId !== 'host'}Joined room:{:else}Created room:{/if}
              <ul class="text-3xl">
                <li>
                  Room ID:
                  <code>{roomId}</code>
                </li>
              </ul>
            </td>
          {/if}
        </tr>
        <tr class="{stepSetupProfile == 'later' ? 'text-gray-500' : ''}">
          {#if stepSetupProfile == 'later'}
            <td>&#x2610;</td>
            <td class="align-middle" in:fade>Setup profile</td>
          {:else if stepSetupProfile == 'doing'}
            <td>&#x2610;</td>
            <td class="align-middle" in:fade>
              <span class="loading">Setting up profile</span>
            </td>
          {:else if stepSetupProfile == 'done'}
            <td>&#x2611;</td>
            <td class="align-middle" in:fade>Your Profile is</td>
          {/if}
        </tr>
        <tr class="{stepWaitForOtherPlayers == 'later' ? 'text-gray-500' : ''}">
          {#if stepWaitForOtherPlayers == 'later'}
            <td>&#x2610;</td>
            <td class="align-middle" in:fade>Invite other players</td>
          {:else if stepWaitForOtherPlayers == 'doing'}
            <td>&#x2610;</td>
            <td class="align-middle" in:fade>
              <span class="loading">Invite other players</span>
            </td>
          {:else if stepWaitForOtherPlayers == 'done'}
            <td>&#x2611;</td>
            <td class="align-middle" in:fade>Start game</td>
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
