<script lang="typescript">
  import { onMount } from "svelte";

  import CrazyChessground from "./CrazyChessground/index.svelte";

  import { Api } from "chessground/api";
  import { Config } from "chessground/config";
  import * as cgtypes from "chessground/types";

  import { Chess } from "chess.js";

  type ClockState = { waiting: boolean; minutes: number; seconds: number };
  type SpareState = {
    dropType: "predrop" | "drop" | undefined;
    dropPiece: cgtypes.Role | undefined;
    pawnCount: number;
    knightCount: number;
    bishopCount: number;
    rookCount: number;
    queenCount: number;
  };

  // just a hacky way to fit the game view to window sizes
  // - resize game view to fill window height
  // - but make sure not to overflow on the x-axis
  // - TODO: make sure a square is not too big
  let gameViewDiv: any;
  function fitGameView() {
    if (!gameViewDiv) return;
    let y = window.innerHeight - gameViewDiv.offsetTop - 5;
    const rect = gameViewDiv.getBoundingClientRect();
    let w = rect.right - rect.left;
    let h = rect.bottom - rect.top;
    let x = (y * w) / h;
    gameViewDiv.style.width = `${Math.min(x, window.innerWidth)}px`;
  }
  let clientWidth: number;
  $: clientWidth && fitGameView();
  window.addEventListener("resize", fitGameView);

  // @ts-ignore
  export let aChessground: Api = undefined;
  export let aChessgroundConfig: Config;
  export let aInteractiveColor: cgtypes.Color | false;
  export let aWhiteIcon: string;
  export let aWhiteClock: ClockState;
  export let aWhiteSpares: SpareState;
  export let aBlackIcon: string;
  export let aBlackClock: ClockState;
  export let aBlackSpares: SpareState;

  // @ts-ignore
  export let bChessground: Api = undefined;
  export let bChessgroundConfig: Config;
  export let bInteractiveColor: cgtypes.Color | false;
  export let bWhiteIcon: string;
  export let bWhiteClock: ClockState;
  export let bWhiteSpares: SpareState;
  export let bBlackIcon: string;
  export let bBlackClock: ClockState;
  export let bBlackSpares: SpareState;
</script>

<div bind:this="{gameViewDiv}" bind:clientWidth class="select-none px-2 flex">
  <div class="w-1/2 mr-2 inline-block">
    <CrazyChessground
      bind:chessground="{aChessground}"
      chessgroundConfig="{aChessgroundConfig}"
      interactiveColor="{aInteractiveColor}"
      whiteIcon="{aWhiteIcon}"
      whiteClock="{aWhiteClock}"
      whiteSpares="{aWhiteSpares}"
      blackIcon="{aBlackIcon}"
      blackClock="{aBlackClock}"
      blackSpares="{aBlackSpares}"
    />
  </div>
  <div class="w-1/2 ml-2 inline-block">
    <CrazyChessground
      bind:chessground="{bChessground}"
      chessgroundConfig="{bChessgroundConfig}"
      interactiveColor="{bInteractiveColor}"
      whiteIcon="{bWhiteIcon}"
      whiteClock="{bWhiteClock}"
      whiteSpares="{bWhiteSpares}"
      blackIcon="{bBlackIcon}"
      blackClock="{bBlackClock}"
      blackSpares="{bBlackSpares}"
    />
  </div>
</div>
