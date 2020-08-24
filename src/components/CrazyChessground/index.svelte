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

  export let whiteName: string;
  export let whiteAvatar: string;
  export let whiteTeam: string;
  export let blackName: string;
  export let blackAvatar: string;
  export let blackTeam: string;

  export let interactive: cgtypes.Color | false;

  export let whiteClock: {
    state: string;
    minutes: number;
    seconds: number;
  };

  export let blackClock: {
    state: string;
    minutes: number;
    seconds: number;
  };

  export let whiteSpares: {
    pawn: number;
    knight: number;
    bishop: number;
    rook: number;
    queen: number;
  };

  export let blackSpares: {
    pawn: number;
    knight: number;
    bishop: number;
    rook: number;
    queen: number;
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
      name="{whiteName}"
      avatar="{whiteAvatar}"
      team="{whiteTeam}"
      clock="{whiteClock}"
      spares="{whiteSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {:else}
    <Meta
      color="black"
      name="{blackName}"
      avatar="{blackAvatar}"
      team="{blackTeam}"
      clock="{blackClock}"
      spares="{blackSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {/if}
  <Chessground bind:chessground config="{chessgroundConfig}" />
  {#if bottomColor == 'white'}
    <Meta
      color="white"
      name="{whiteName}"
      avatar="{whiteAvatar}"
      team="{whiteTeam}"
      clock="{whiteClock}"
      spares="{whiteSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {:else}
    <Meta
      color="black"
      name="{blackName}"
      avatar="{blackAvatar}"
      team="{blackTeam}"
      clock="{blackClock}"
      spares="{blackSpares}"
      on:spareDragNewPiece="{spareDragNewPiece}"
    />
  {/if}
</div>
