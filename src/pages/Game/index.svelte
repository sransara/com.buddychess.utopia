<script lang="typescript">
  import { onMount } from "svelte";

  import CrazyChessground from "../../components/CrazyChessground/index.svelte";

  import { Api } from "chessground/api";
  import { Config } from "chessground/config";

  // @ts-ignore
  export let chessground: Api = undefined;

  const chessgroundConfig: Config = {
    orientation: "black",
  };

  onMount(() => {
    setTimeout(function () {
      //chessground.stop()
    }, 3000);
  });
</script>

<CrazyChessground
  isMyChessground="{true}"
  bind:chessground
  chessgroundConfig="{chessgroundConfig}"
  topColor="{chessgroundConfig.orientation == 'white' ? 'black' : 'white'}"
  topSparePawnCount="{0}"
  topSpareKnightCount="{0}"
  topSpareBishopCount="{0}"
  topSpareRookCount="{0}"
  topSpareQueenCount="{0}"
  topAvatarIcon="elephant"
  topClockMinutes="{5}"
  topClockSeconds="{0}"
  bottomColor="{chessgroundConfig.orientation == 'white' ? 'white' : 'black'}"
  bottomSparePawnCount="{0}"
  bottomSpareKnightCount="{0}"
  bottomSpareBishopCount="{0}"
  bottomSpareRookCount="{0}"
  bottomSpareQueenCount="{0}"
  bottomAvatarIcon="giraffe"
  bottomClockMinutes="{5}"
  bottomClockSeconds="{0}"
/>
