<script lang="typescript">
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

  // @ts-ignore
  export let buddyChessground: HTMLElement = undefined;

  // @ts-ignore
  export let aChessground: Api = undefined;
  export let aChessgroundConfig: Config;
  export let aInteractive: cgtypes.Color | false;
  export let aWhiteAvatar: string;
  export let aWhiteClock: ClockState;
  export let aWhiteSpares: SpareState;
  export let aBlackAvatar: string;
  export let aBlackClock: ClockState;
  export let aBlackSpares: SpareState;

  // @ts-ignore
  export let bChessground: Api = undefined;
  export let bChessgroundConfig: Config;
  export let bInteractive: cgtypes.Color | false;
  export let bWhiteAvatar: string;
  export let bWhiteClock: ClockState;
  export let bWhiteSpares: SpareState;
  export let bBlackAvatar: string;
  export let bBlackClock: ClockState;
  export let bBlackSpares: SpareState;
</script>

<div bind:this="{buddyChessground}" class="flex select-none px-2" style="width: 50vw;">
  <div class="w-1/2 pr-2 inline-block {aInteractive ? 'cursor-pointer' : 'cursor-default'}">
    <CrazyChessground
      bind:chessground="{aChessground}"
      chessgroundConfig="{aChessgroundConfig}"
      interactive="{aInteractive}"
      whiteAvatar="{aWhiteAvatar}"
      whiteClock="{aWhiteClock}"
      whiteSpares="{aWhiteSpares}"
      blackAvatar="{aBlackAvatar}"
      blackClock="{aBlackClock}"
      blackSpares="{aBlackSpares}"
    />
  </div>
  <div class="w-1/2 pl-2 inline-block {bInteractive ? 'cursor-pointer' : 'cursor-default'} ">
    <CrazyChessground
      bind:chessground="{bChessground}"
      chessgroundConfig="{bChessgroundConfig}"
      interactive="{bInteractive}"
      whiteAvatar="{bWhiteAvatar}"
      whiteClock="{bWhiteClock}"
      whiteSpares="{bWhiteSpares}"
      blackAvatar="{bBlackAvatar}"
      blackClock="{bBlackClock}"
      blackSpares="{bBlackSpares}"
    />
  </div>
</div>
