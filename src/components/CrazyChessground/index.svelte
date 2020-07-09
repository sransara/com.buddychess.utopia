<script lang="typescript">
  import Chessground from "../Chessground/index.svelte";
  import Meta from "./meta.svelte";

  import { Config } from "chessground/config";
  import { Api } from "chessground/api";
  import * as cgtypes from "chessground/types";

  export let isMyChessground: boolean;
  // @ts-ignore
  export let chessground: Api = undefined;
  export let chessgroundConfig: Config;

  export let topColor: cgtypes.Color;
  export let topAvatarIcon: string;
  export let topClockMinutes: number;
  export let topClockSeconds: number;
  export let topSparePawnCount: number;
  export let topSpareKnightCount: number;
  export let topSpareBishopCount: number;
  export let topSpareRookCount: number;
  export let topSpareQueenCount: number;

  export let bottomColor: cgtypes.Color;
  export let bottomAvatarIcon: string;
  export let bottomClockMinutes: number;
  export let bottomClockSeconds: number;
  export let bottomSparePawnCount: number;
  export let bottomSpareKnightCount: number;
  export let bottomSpareBishopCount: number;
  export let bottomSpareRookCount: number;
  export let bottomSpareQueenCount: number;
</script>

<div class="flex flex-col">
  <Meta
    isMyChessground="{isMyChessground}"
    chessground="{chessground}"
    color="{topColor}"
    sparePawnCount="{topSparePawnCount}"
    spareKnightCount="{topSpareKnightCount}"
    spareBishopCount="{topSpareBishopCount}"
    spareRookCount="{topSpareRookCount}"
    spareQueenCount="{topSpareQueenCount}"
    avatarIcon="{topAvatarIcon}"
    clockMinutes="{topClockMinutes}"
    clockSeconds="{topClockSeconds}"
  />
  <Chessground bind:chessground config="{chessgroundConfig}" />
  <Meta
    isMyChessground="{isMyChessground}"
    chessground="{chessground}"
    color="{bottomColor}"
    sparePawnCount="{bottomSparePawnCount}"
    spareKnightCount="{bottomSpareKnightCount}"
    spareBishopCount="{bottomSpareBishopCount}"
    spareRookCount="{bottomSpareRookCount}"
    spareQueenCount="{bottomSpareQueenCount}"
    avatarIcon="{bottomAvatarIcon}"
    clockMinutes="{bottomClockMinutes}"
    clockSeconds="{bottomClockSeconds}"
  />
</div>
