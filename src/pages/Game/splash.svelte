<script lang="typescript">
  import Avatar from "../../components/Avatar/index.svelte";
  import Piece from "../../components/Piece.svelte";
  import { fade } from "svelte/transition";
  import { spots$, wizard$ } from "../../common/datastore";
  import * as global from "../../common/dataglobal";
  import * as wizard from "../../common/wizard";
  import * as utils from "../../common/utils";
  import { createEventDispatcher } from "svelte";
  import * as cgtypes from "chessground/types";

  const dispatch = createEventDispatcher();

  export let myColor: cgtypes.Color;
  export let opColor: cgtypes.Color;
  export let myId: string;
  export let opId: string;
  export let buddyColor: cgtypes.Color;
  export let buddyId: string;
  export let opBuddyColor: cgtypes.Color;
  export let opBuddyId: string;
</script>

<style>
  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  .shaking {
    animation: shake 1s infinite;
    transform: translate3d(0, 0, 0);
  }
</style>

<div
  out:fade
  class="absolute left-0 bg-white items-center justify-center z-50 flex overflow-auto"
  style="min-height: 24rem; height: calc(100vh - 5rem); min-width: 60rem; width: 80vw;"
>
  <div class="flex flex-col">
    <div class="flex w-64 h-16 items-center justify-center text-3xl">
      {#if wizard.isBefore(utils.getAttr($spots$, [opBuddyId, 'wizard'], wizard.reset), wizard.steps.WAIT_FOR_GAME, 'doing')}
        <span class="w-full inline-block bg-gray-200 px-2 py-1 text-center">Ready?</span>
      {:else}
        <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
      {/if}
    </div>
    <div class="flex w-64 h-8 items-center justify-center text-2xl bg-yellow-500">
      {utils.getAttr($spots$, [opBuddyId, 'name'])}
    </div>
    <div class="flex w-64 h-32">
      <span
        class="{global.teambg[utils.getAttr($spots$, [opBuddyId, 'team'])]} inline-block w-1/2 h-full border
        border-gray-400"
      >
        <Avatar avatar="{utils.getAttr($spots$, [opBuddyId, 'avatar'])}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{opBuddyColor}" />
      </span>
    </div>
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full cg-square dark"></span>
      <span class="inline-block w-1/2 h-full cg-square light"></span>
    </div>
    <div class="flex w-64 h-32">
      <span
        class="{global.teambg[utils.getAttr($spots$, [buddyId, 'team'])]} inline-block w-1/2 h-full border
        border-gray-400"
      >
        <Avatar avatar="{utils.getAttr($spots$, [buddyId, 'avatar'])}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{buddyColor}" />
      </span>
    </div>
    <div class="flex w-64 h-8 items-center justify-center text-2xl bg-yellow-500">
      {utils.getAttr($spots$, [buddyId, 'name'])}
    </div>
    <div class="flex w-64 h-6 items-center justify-center text-base bg-yellow-500 text-gray-800">Your buddy</div>
    <div class="flex w-64 h-16 items-center justify-center text-3xl">
      {#if wizard.isBefore(utils.getAttr($spots$, [buddyId, 'wizard'], wizard.reset), wizard.steps.WAIT_FOR_GAME, 'doing')}
        <span class="w-full inline-block bg-gray-200 px-2 py-1 text-center">Ready?</span>
      {:else}
        <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
      {/if}
    </div>
  </div>
  <div class="flex flex-col">
    <div class="flex w-32 h-32 items-center justify-center text-4xl font-serif">&amp;</div>
    <div class="flex w-32 h-32 items-center justify-center text-6xl font-serif">vs</div>
    <div class="flex w-32 h-32 items-center justify-center text-4xl font-serif">&amp;</div>
  </div>
  <div class="flex flex-col">
    <div class="flex w-64 h-16 items-center justify-center text-3xl">
      {#if wizard.isBefore(utils.getAttr($spots$, [opId, 'wizard'], wizard.reset), wizard.steps.WAIT_FOR_GAME, 'doing')}
        <span class="w-full inline-block bg-gray-200 px-2 py-1 text-center">Ready?</span>
      {:else}
        <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
      {/if}
    </div>
    <div class="flex w-64 h-8 items-center justify-center text-2xl bg-yellow-500">
      {utils.getAttr($spots$, [opId, 'name'])}
    </div>
    <div class="flex w-64 h-32">
      <span
        class="{global.teambg[utils.getAttr($spots$, [opId, 'team'])]} inline-block w-1/2 h-full border border-gray-400"
      >
        <Avatar avatar="{utils.getAttr($spots$, [opId, 'avatar'])}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{opColor}" />
      </span>
    </div>
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full cg-square dark"></span>
      <span class="inline-block w-1/2 h-full cg-square light"></span>
    </div>
    <div class="flex w-64 h-32">
      <span
        class="{global.teambg[utils.getAttr($spots$, [myId, 'team'])]} inline-block w-1/2 h-full border border-gray-400"
      >
        <Avatar avatar="{utils.getAttr($spots$, [myId, 'avatar'])}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{myColor}" />
      </span>
    </div>
    <div class="flex w-64 h-8 items-center justify-center text-2xl bg-yellow-500">
      {utils.getAttr($spots$, [myId, 'name'])}
    </div>
    <div class="flex w-64 h-6 items-center justify-center text-base bg-yellow-500 text-gray-800">You</div>
    <div class="flex w-64 h-16 items-center justify-center text-3xl">
      {#if wizard.isBefore($wizard$, wizard.steps.WAIT_FOR_GAME)}
        <button class="w-full bg-gray-500 text-black px-2 py-1 focus:outline-none rounded-lg" disabled="{true}">
          Ready?
        </button>
      {:else if wizard.isIn($wizard$, wizard.steps.WAIT_FOR_GAME, 'todo')}
        <button
          class="w-full bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 focus:outline-none rounded-lg shaking"
          on:click="{() => dispatch('waitForGame')}"
        >
          Ready?
        </button>
      {:else}
        <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
      {/if}
    </div>
  </div>
</div>
