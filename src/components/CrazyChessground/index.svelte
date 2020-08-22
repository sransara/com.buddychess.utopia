<script lang="typescript">
  import Chessground from "../Chessground/index.svelte";
  import Meta from "./meta.svelte";

  import { Config } from "chessground/config";
  import { Api } from "chessground/api";
  import * as cgtypes from "chessground/types";

  // @ts-ignore
  export let chessground: Api = undefined;
  export let chessgroundConfig: Config;

  let topColor: cgtypes.Color;
  $: topColor = chessgroundConfig.orientation === "white" ? "black" : "white";
  let bottomColor: cgtypes.Color;
  $: bottomColor = chessgroundConfig.orientation === "white" ? "white" : "black";

  export let interactive: cgtypes.Color | false;

  export let whiteAvatar: string;
  export let blackAvatar: string;

  export let whiteClock: {
    waiting: boolean;
    minutes: number;
    seconds: number;
  };

  export let blackClock: {
    waiting: boolean;
    minutes: number;
    seconds: number;
  };

  export let whiteSpares: {
    pawnCount: number;
    knightCount: number;
    bishopCount: number;
    rookCount: number;
    queenCount: number;
  };

  export let blackSpares: {
    pawnCount: number;
    knightCount: number;
    bishopCount: number;
    rookCount: number;
    queenCount: number;
  };

  function spareDragNewPiece(e: Event) {
    const data = (e as CustomEvent).detail;
    if (data.pieceCount < 1) return;
    if (interactive !== data.pieceColor) return;
    const piece = { role: data.pieceRole, color: data.pieceColor };
    const event = data.event;
    chessground.dragNewPiece(piece, event);
  }
</script>

<div class="flex flex-col">
  {#if topColor == 'white'}
    <Meta
      color="white"
      avatar="{whiteAvatar}"
      clock="{whiteClock}"
      spares="{whiteSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {:else}
    <Meta
      color="black"
      avatar="{blackAvatar}"
      clock="{blackClock}"
      spares="{blackSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {/if}
  <Chessground bind:chessground config="{chessgroundConfig}" />
  {#if bottomColor == 'white'}
    <Meta
      color="white"
      avatar="{whiteAvatar}"
      clock="{whiteClock}"
      spares="{whiteSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {:else}
    <Meta
      color="black"
      avatar="{blackAvatar}"
      clock="{blackClock}"
      spares="{blackSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {/if}
</div>
