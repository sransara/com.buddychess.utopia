<script lang="typescript">
  import { onMount, tick } from "svelte";
  import { replace } from "svelte-spa-router";
  import Avatar from "./components/Avatar/index.svelte";
  import { EventBusSingleton as EventBus } from "light-event-bus";
  import { roomId$, playerId$, gamen$, spots$, wizard$ } from "./common/datastore";
  import * as msgbus from "./common/msgbus";
  import * as global from "./common/dataglobal";
  import * as wizard from "./common/wizard";

  const tabstyles: any = {
    active: "border-l border-t border-r text-gray-900 font-bold",
    inactive: "border-b text-blue-700 hover:bg-blue-700 hover:text-white",
  };

  let roomChatDiv: HTMLDivElement;
  let roomChatMsgs: any[] = [];
  let roomChatMsg: string = "";
  $: if (roomChatDiv && roomChatMsgs) scrollToBottomRoomChat();

  function addMsg(msgs: any[], msg: any) {
    msgs.push(msg);
    return msgs.slice(-50);
  }

  function sendRoomChat() {
    if (!roomChatMsg) return;
    if (!($roomId$ && $playerId$ && Object.keys($spots$).includes($playerId$))) {
      EventBus.publish("roomChatMsg", {
        from: "internal",
        type: "error",
        data: "You need to first join and reserve a spot in a room.",
      });
    } else {
      EventBus.publish("roomChatMsg", {
        from: "me",
        spot: {
          name: $spots$[$playerId$]["name"],
          avatar: $spots$[$playerId$]["avatar"],
          team: $spots$[$playerId$]["team"],
        },
        data: roomChatMsg,
      });
      msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "roomChatPeerMsg", roomChatMsg);
    }
    roomChatMsg = "";
  }

  async function scrollToBottomRoomChat() {
    await tick();
    roomChatDiv.scrollTo(0, roomChatDiv.scrollHeight);
  }

  onMount(() => {
    EventBus.subscribe("roomChatMsg", async (arg: any) => {
      roomChatMsgs = addMsg(roomChatMsgs, arg);
    });

    EventBus.subscribe("roomChatPeerMsg", async (arg: any) => {
      const fromId = arg.from;
      EventBus.publish("roomChatMsg", {
        from: "peer",
        spot: {
          name: $spots$[fromId]["name"],
          avatar: $spots$[fromId]["avatar"],
          team: $spots$[fromId]["team"],
        },
        data: arg.payload,
      });
    });
  });

  function getMsgStyleClasses(msg: any) {
    if (msg["from"] == "me" || msg["from"] == "peer") {
      if (msg["spot"]) {
        if (msg["spot"]["team"] == "red") return "bg-red-300";
        if (msg["spot"]["team"] == "blue") return "bg-blue-300";
      } else {
        return "bg-purple-300";
      }
    } else if (msg["from"] == "endgame") {
      if (msg["spot"]["team"] == "red") return "border-red-600";
      if (msg["spot"]["team"] == "blue") return "border-blue-600";
    } else if (msg["from"] == "internal") {
      if (msg["type"]) {
        if (msg["type"] == "error") return "bg-orange-300";
      }
    }

    return "bg-gray-300";
  }

  function rematch() {
    if (!wizard.isIn($wizard$, wizard.steps.END_GAME)) return;

    $wizard$ = wizard.todo(wizard.steps.WAIT_FOR_SPOTS);
    if ($playerId$ == "host") {
      replace(`/room/create/${$roomId$}`);
    } else {
      replace(`/room/join/${$roomId$}`);
    }
  }
</script>

<style>
  /* 
  .tab {
    bg-white inline-block rounded-t py-2 px-2 focus:outline-none
  }

  .active {
    border-l border-t border-r text-black font-bold
  }

  .not-active {
    text-blue-700  border-b hover:bg-blue-700 hover:text-white
  }

  .disabled {
    text-gray-500 border-b 
  }
  */
</style>

<div class="flex flex-col p-2 w-full" style="min-height: 24rem; height: calc(100vh - 5rem);">
  <div class="bg-gray-800 p-1 rounded-t-md text-white">Chat</div>
  <div bind:this="{roomChatDiv}" class="flex-grow flex flex-col p-2 overflow-y-auto overflow-x-hidden border">
    <div class="flex-grow"></div>
    {#each roomChatMsgs as msg}
      {#if msg['from'] == 'me' || msg['from'] == 'peer'}
        <div class="flex mb-1 {msg['from'] == 'me' ? 'justify-end' : 'justify-start'}">
          <div class="w-5/6 flex flex-col p-1 rounded-md {getMsgStyleClasses(msg)}">
            {#if msg['spot']}
              <div class="flex justify-start items-center">
                <span class="h-5 w-5">
                  <Avatar avatar="{msg['spot']['avatar']}" />
                </span>
                <span class="ml-1 font-semibold text-gray-700">{msg['spot']['name']}</span>
              </div>
            {/if}
            <div>{msg['data']}</div>
          </div>
        </div>
      {:else if msg['from'] == 'endgame'}
        <div class="flex my-2 flex-col p-1 rounded-md border-2 {getMsgStyleClasses(msg)}">
          <div class="mb-1">
            <span class="h-5 w-5 inline-block float-left">
              <Avatar avatar="{msg['spot']['avatar']}" />
            </span>
            <span class="font-semibold ml-1">{msg['spot']['name']}</span>
            <span class="ml-1">{msg['event']}.</span>
          </div>
          <div class="mb-1">
            {#if msg['spot']['team'] == $spots$[$playerId$]['team']}
              Your team lost this round :(
            {:else}Your team won this round :){/if}
          </div>
          <div>
            Rematch?
            <button
              class="{wizard.isIn($wizard$, wizard.steps.END_GAME) && $gamen$ == msg['gamen'] ? 'bg-blue-500 hover:bg-blue-700 text-white' : 'bg-green-500 text-black'}
              font-bold py-1 px-1 rounded focus:outline-none"
              disabled="{!(wizard.isIn($wizard$, wizard.steps.END_GAME) && $gamen$ == msg['gamen'])}"
              on:click="{rematch}"
            >
              Yes
            </button>
          </div>
        </div>
      {:else if msg['from'] == 'internal'}
        <div class="flex mb-1 p-1 rounded-md {getMsgStyleClasses(msg)}">{msg['data']}</div>
      {/if}
    {/each}
  </div>
  <div class="flex flex-col border-r border-l border-b border-4 p-2 bg-gray-100">
    <input
      type="text"
      bind:value="{roomChatMsg}"
      maxlength="{60}"
      class="my-1 p-1 resize-none border border-black"
      placeholder="Type a message to broadcast to your room"
      on:keydown="{(e) => {
        if (e.key === 'Enter') sendRoomChat();
      }}"
    />
    <button
      class="my-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded focus:outline-none"
      on:click="{sendRoomChat}"
    >
      Send (Enter)
    </button>
  </div>
</div>
