<script lang="typescript">
  import { onMount } from "svelte";

  import CrazyChessground from "../../components/CrazyChessground/index.svelte";

  import { Api } from "chessground/api";
  import { Config } from "chessground/config";

  // @ts-ignore
  export let myChessground: Api = undefined;
  // @ts-ignore
  export let buddyChessground: Api = undefined;

  const myChessgroundConfig: Config = {
    orientation: "black",
  };

  const buddyChessgroundConfig: Config = {
    orientation: "white",
  };

  let gamediv: any;

  function fitGameView() {
    if (!gamediv) return;
    let y = window.innerHeight - gamediv.offsetTop - 5;
    const rect = gamediv.getBoundingClientRect();
    let w = rect.right - rect.left;
    let h = rect.bottom - rect.top;
    let x = (y * w) / h;
    gamediv.style.width = `${Math.min(x, window.innerWidth)}px`;
  }

  let clientWidth: number;
  $: clientWidth && fitGameView(); // Chrome updates div render height multiple times
  window.addEventListener("resize", fitGameView);
</script>

<div class="select-none px-2 flex" bind:this="{gamediv}" bind:clientWidth>
  <div class="w-1/2 pr-2 inline-block">
    <CrazyChessground
      isMyChessground="{true}"
      bind:chessground="{myChessground}"
      chessgroundConfig="{myChessgroundConfig}"
      topColor="{myChessgroundConfig.orientation == 'white' ? 'black' : 'white'}"
      topSparePawnCount="{0}"
      topSpareKnightCount="{0}"
      topSpareBishopCount="{0}"
      topSpareRookCount="{1}"
      topSpareQueenCount="{0}"
      topAvatarIcon="elephant"
      topClockMinutes="{5}"
      topClockSeconds="{0}"
      bottomColor="{myChessgroundConfig.orientation == 'white' ? 'white' : 'black'}"
      bottomSparePawnCount="{0}"
      bottomSpareKnightCount="{0}"
      bottomSpareBishopCount="{0}"
      bottomSpareRookCount="{0}"
      bottomSpareQueenCount="{0}"
      bottomAvatarIcon="giraffe"
      bottomClockMinutes="{5}"
      bottomClockSeconds="{0}"
    />
  </div>
  <div class="w-1/2 pl-2 inline-block">
    <CrazyChessground
      isMyChessground="{false}"
      bind:chessground="{buddyChessground}"
      chessgroundConfig="{buddyChessgroundConfig}"
      topColor="{buddyChessgroundConfig.orientation == 'white' ? 'black' : 'white'}"
      topSparePawnCount="{0}"
      topSpareKnightCount="{0}"
      topSpareBishopCount="{0}"
      topSpareRookCount="{0}"
      topSpareQueenCount="{0}"
      topAvatarIcon="elephant"
      topClockMinutes="{5}"
      topClockSeconds="{0}"
      bottomColor="{buddyChessgroundConfig.orientation == 'white' ? 'white' : 'black'}"
      bottomSparePawnCount="{0}"
      bottomSpareKnightCount="{0}"
      bottomSpareBishopCount="{0}"
      bottomSpareRookCount="{0}"
      bottomSpareQueenCount="{0}"
      bottomAvatarIcon="giraffe"
      bottomClockMinutes="{5}"
      bottomClockSeconds="{0}"
    />
  </div>
</div>
