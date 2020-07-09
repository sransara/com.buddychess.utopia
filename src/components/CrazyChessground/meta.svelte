<script lang="typescript">
  import Spares from "./spares.svelte";
  import Avatar from "./avatar.svelte";
  import Clock from "./clock.svelte";

  import { Api } from "chessground/api";
  import * as cgtypes from "chessground/types";

  export let isMyChessground: boolean;
  export let chessground: Api;
  export let color: cgtypes.Color;
  export let sparePawnCount: number;
  export let spareKnightCount: number;
  export let spareBishopCount: number;
  export let spareRookCount: number;
  export let spareQueenCount: number;
  export let avatarIcon: string;
  export let clockMinutes: number;
  export let clockSeconds: number;
</script>

<style global>
  .pb-1\/8 {
    padding-bottom: 12.5%;
  }

  .w-1\/8 {
    width: 12.5%;
  }
</style>

<div class="relative w-full my-1 pb-1/8">
  <div class="absolute table bottom-0 w-1/8 pb-1/8">
    <div class="absolute h-full bottom-0 flex flex-row" style="width: 800%;">
      <div class="bg-gray-200 border border-gray-400 inline-block w-1/8">
        <Avatar icon="{avatarIcon}" />
      </div>
      <div class="inline-block w-1/4 bg-green-600">
        <Clock minutes="{clockMinutes}" seconds="{clockSeconds}" />
      </div>
      <div class="bg-gray-200 border border-gray-400 flex" style="width: 62.5%;">
        <Spares
          isMyChessground="{isMyChessground}"
          chessground="{chessground}"
          color="{color}"
          pawnCount="{sparePawnCount}"
          knightCount="{spareKnightCount}"
          bishopCount="{spareBishopCount}"
          rookCount="{spareRookCount}"
          queenCount="{spareQueenCount}"
        />
      </div>
    </div>
  </div>
</div>
