<script lang="typescript">
  import { onMount, tick } from "svelte";
  import Avatar from "./Avatar/index.svelte";
  import { EventBusSingleton as EventBus } from "light-event-bus";
  import {
    _roomId$,
    roomId$,
    _playerId$,
    playerId$,
    spots$,
    wizard$,
    gamen$,
    crazy$,
    acg$,
    bcg$,
  } from "../common/datastore";
  import * as msgbus from "../common/msgbus";
  import * as global from "../common/dataglobal";

  const tabstyles: any = {
    active: "border-l border-t border-r text-gray-900 font-bold",
    inactive: "border-b text-blue-700 hover:bg-blue-700 hover:text-white",
  };

  let roomChatState: "inactive" | "active" = "inactive";
  let roomChatUnreads = 0;
  let roomChatDiv: HTMLDivElement;
  let roomChatMsgs: any[] = [];
  let roomChatMsg: string = "";
  $: if (roomChatDiv && roomChatMsgs) scrollToBottomRoomChat();

  let loungeChatState: "inactive" | "active" = "active";
  let loungeChatUnreads = 0;
  let loungeChatDiv: HTMLDivElement;
  let loungeChatMsgs: any[] = [];
  $: if (loungeChatDiv && loungeChatMsgs) scrollToBottomLoungeChat();

  function openRoomChat() {
    loungeChatState = "inactive";
    roomChatState = "active";
    roomChatUnreads = 0;
  }

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
        data: "Please join and reserve a spot in the room.",
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

  function openLounge() {
    loungeChatState = "active";
    roomChatState = "inactive";
    loungeChatUnreads = 0;
  }

  async function scrollToBottomLoungeChat() {
    await tick();
    loungeChatDiv.scrollTo(0, loungeChatDiv.scrollHeight);
  }

  onMount(() => {
    EventBus.subscribe("roomChatMsg", async (arg: any) => {
      if (roomChatState == "inactive") roomChatUnreads = roomChatUnreads + 1;
      roomChatMsgs = addMsg(roomChatMsgs, arg);
    });

    EventBus.subscribe("loungeChatMsg", async (arg: any) => {
      if (loungeChatState == "inactive") loungeChatUnreads = loungeChatUnreads + 1;
      loungeChatMsgs = addMsg(loungeChatMsgs, arg);
    });

    EventBus.subscribe("roomChatPeerMsg", async (arg: any) => {
      if (roomChatState == "inactive") roomChatUnreads = roomChatUnreads + 1;

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

  function getMsgBackground(msg: any) {
    if (msg["from"] == "me" || msg["from"] == "peer") {
      if (msg["spot"]) {
        if (msg["spot"]["team"] == "red") return "bg-red-300";
        if (msg["spot"]["team"] == "blue") return "bg-blue-300";
      } else {
        return "bg-purple-300";
      }
    } else if (msg["from"] == "internal") {
      if (msg["type"]) {
        if (msg["type"] == "error") return "bg-orange-300";
      } else {
        return "bg-gray-300";
      }
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
  .chat-with-notifs:not([data-unreads="0"])::after {
    content: attr(data-unreads);
    padding: 0 0.3rem;
    font-weight: bold;
    background: #eb6105;
    color: #fff;
    margin-left: 5px;
  }
</style>

<div class="flex flex-col py-1 pr-2 w-full" style="height: calc(100vh - 5rem);">
  <ul class="flex">
    <li>
      <button
        class="chat-with-notifs bg-white inline-block rounded-t py-2 px-2 focus:outline-none {tabstyles[roomChatState]}"
        data-unreads="{roomChatUnreads}"
        on:click="{openRoomChat}"
      >
        Room
      </button>
    </li>
    <li>
      <button
        class="chat-with-notifs bg-white inline-block rounded-t py-2 px-2 focus:outline-none {tabstyles[loungeChatState]}"
        data-unreads="{loungeChatUnreads}"
        on:click="{openLounge}"
      >
        Lounge
      </button>
    </li>
    <li class="flex-grow border-b-2"></li>
  </ul>
  {#if roomChatState == 'active' && loungeChatState == 'inactive'}
    <div
      bind:this="{roomChatDiv}"
      class="flex-grow flex flex-col overflow-y-auto overflow-x-hidden border-r border-l p-2"
    >
      <div class="flex-grow"></div>
      {#each roomChatMsgs as msg}
        {#if msg['from'] == 'me' || msg['from'] == 'peer'}
          <div class="flex mb-1 {msg['from'] == 'me' ? 'justify-end' : 'justify-start'}">
            <div class="w-5/6 flex flex-col p-1 rounded-md {getMsgBackground(msg)}">
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
        {:else if msg['from'] == 'internal'}
          <div class="flex mb-1 flex-col p-1 rounded-md {getMsgBackground(msg)}">{msg['data']}</div>
        {/if}
      {/each}
    </div>
    <div class="flex flex-col border-r border-l border-b p-2">
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
  {:else if roomChatState == 'inactive' && loungeChatState == 'active'}
    <div
      bind:this="{loungeChatDiv}"
      class="flex-grow flex flex-col overflow-y-auto overflow-x-hidden border-r border-l p-2"
    >
      <div class="flex-grow"></div>
      {#each loungeChatMsgs as msg}
        <div>{msg}</div>
      {/each}
    </div>
  {/if}
</div>
