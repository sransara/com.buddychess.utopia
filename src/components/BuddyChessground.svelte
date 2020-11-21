<script lang="typescript">
  import CrazyChessground from "./CrazyChessground/index.svelte";

  import { Api } from "chessground/api";
  import { Config } from "chessground/config";
  import * as cgtypes from "chessground/types";

  import { Chess } from "chess.js";

  type ClockState = { state: string; minutes: number; seconds: number };
  type SpareState = {
    dropType: "predrop" | "drop" | undefined;
    dropRole: cgtypes.Role | undefined;
    pawn: number;
    knight: number;
    bishop: number;
    rook: number;
    queen: number;
  };

  // @ts-ignore
  export let buddyChessground: HTMLElement = undefined;

  // @ts-ignore
  export let aChessground: Api = undefined;
  export let aChessgroundConfig: Config;
  export let aInteractive: cgtypes.Color | false;
  export let aWhiteName: string;
  export let aWhiteAvatar: string;
  export let aWhiteTeam: string;
  export let aWhiteClock: ClockState;
  export let aWhiteSpares: SpareState;
  export let aBlackName: string;
  export let aBlackAvatar: string;
  export let aBlackTeam: string;
  export let aBlackClock: ClockState;
  export let aBlackSpares: SpareState;

  // @ts-ignore
  export let bChessground: Api = undefined;
  export let bChessgroundConfig: Config;
  export let bInteractive: cgtypes.Color | false;
  export let bWhiteName: string;
  export let bWhiteAvatar: string;
  export let bWhiteTeam: string;
  export let bWhiteClock: ClockState;
  export let bWhiteSpares: SpareState;
  export let bBlackName: string;
  export let bBlackAvatar: string;
  export let bBlackTeam: string;
  export let bBlackClock: ClockState;
  export let bBlackSpares: SpareState;
</script>

<div bind:this="{buddyChessground}" class="flex select-none px-2" style="width: 50vw;">
  <div class="w-1/2 inline-block {aInteractive ? 'cursor-pointer' : 'cursor-default'}" style="margin-right: 4px;">
    <CrazyChessground
      bind:chessground="{aChessground}"
      chessgroundConfig="{aChessgroundConfig}"
      interactive="{aInteractive}"
      whiteName="{aWhiteName}"
      whiteAvatar="{aWhiteAvatar}"
      whiteTeam="{aWhiteTeam}"
      whiteClock="{aWhiteClock}"
      whiteSpares="{aWhiteSpares}"
      blackName="{aBlackName}"
      blackAvatar="{aBlackAvatar}"
      blackTeam="{aBlackTeam}"
      blackClock="{aBlackClock}"
      blackSpares="{aBlackSpares}"
    />
  </div>
  <div class="w-1/2 inline-block {bInteractive ? 'cursor-pointer' : 'cursor-default'}" style="margin-left: 4px;">
    <CrazyChessground
      bind:chessground="{bChessground}"
      chessgroundConfig="{bChessgroundConfig}"
      interactive="{bInteractive}"
      whiteName="{bWhiteName}"
      whiteAvatar="{bWhiteAvatar}"
      whiteTeam="{bWhiteTeam}"
      whiteClock="{bWhiteClock}"
      whiteSpares="{bWhiteSpares}"
      blackName="{bBlackName}"
      blackAvatar="{bBlackAvatar}"
      blackTeam="{bBlackTeam}"
      blackClock="{bBlackClock}"
      blackSpares="{bBlackSpares}"
    />
  </div>
</div>
