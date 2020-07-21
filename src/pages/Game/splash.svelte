<script lang="typescript">
  import { fade } from "svelte/transition";

  import Avatar from "../../components/Avatar/index.svelte";
  import Piece from "../../components/Piece.svelte";

  import * as cgtypes from "chessground/types";

  export let aInteractiveColor: cgtypes.Color | false;
  export let aOrientation: cgtypes.Color;
  export let aWhiteIcon: string;
  export let aBlackIcon: string;

  export let bInteractiveColor: cgtypes.Color | false;
  export let bOrientation: string;
  export let bWhiteIcon: string;
  export let bBlackIcon: string;

  let aTopColor: cgtypes.Color;
  let aTopIcon: string;
  $: aTopColor = aOrientation == "white" ? "black" : "white";
  $: aTopIcon = aTopColor == "white" ? aWhiteIcon : aBlackIcon;

  let aBottomColor: cgtypes.Color;
  let aBottomIcon: string;
  $: aBottomColor = aOrientation == "white" ? "white" : "black";
  $: aBottomIcon = aBottomColor == "white" ? aWhiteIcon : aBlackIcon;

  let bTopColor: cgtypes.Color;
  let bTopIcon: string;
  $: bTopColor = bOrientation == "white" ? "black" : "white";
  $: bTopIcon = bTopColor == "white" ? bWhiteIcon : bBlackIcon;

  let bBottomColor: cgtypes.Color;
  let bBottomIcon: string;
  $: bBottomColor = bOrientation == "white" ? "white" : "black";
  $: bBottomIcon = bBottomColor == "white" ? bWhiteIcon : bBlackIcon;
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

<div out:fade class="w-full h-full fixed flex left-0 bg-white items-center justify-center z-50">
  <div class="flex flex-col" class:shaking="{aInteractiveColor}">
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full bg-gray-200 border border-gray-400">
        <Avatar icon="{aTopIcon}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{aTopColor}" />
      </span>
    </div>
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full cg-square dark"></span>
      <span class="inline-block w-1/2 h-full cg-square light"></span>
    </div>
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full bg-gray-200 border border-gray-400">
        <Avatar icon="{aBottomIcon}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{aBottomColor}" />
      </span>
    </div>
    <div class="flex w-64 h-16 items-center justify-center text-3xl bg-yellow-500">
      {aInteractiveColor ? 'You' : 'Your buddy'}
    </div>
  </div>
  <div class="flex flex-col">
    <div class="flex w-32 h-32 items-center justify-center text-4xl font-serif">&amp;</div>
    <div class="flex w-32 h-32 items-center justify-center text-6xl font-serif">vs</div>
    <div class="flex w-32 h-32 items-center justify-center text-4xl font-serif">&amp;</div>
    <div class="flex w-32 h-16 items-center justify-center font-serif"></div>
  </div>
  <div class="flex flex-col" class:shaking="{bInteractiveColor}">
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full bg-gray-200 border border-gray-400">
        <Avatar icon="{bTopIcon}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{bTopColor}" />
      </span>
    </div>
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full cg-square dark"></span>
      <span class="inline-block w-1/2 h-full cg-square light"></span>
    </div>
    <div class="flex w-64 h-32">
      <span class="inline-block w-1/2 h-full bg-gray-200 border border-gray-400">
        <Avatar icon="{bBottomIcon}" />
      </span>
      <span class="inline-block w-1/2 h-full cg-square dark">
        <Piece role="king" color="{bBottomColor}" />
      </span>
    </div>
    <div class="flex w-64 h-16 items-center justify-center text-3xl bg-yellow-500">
      {bInteractiveColor ? 'You' : 'Your buddy'}
    </div>
  </div>
</div>
