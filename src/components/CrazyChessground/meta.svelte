<script lang="typescript">
  import { createEventDispatcher } from "svelte";

  import { Api } from "chessground/api";
  import * as cgtypes from "chessground/types";

  import Spares from "./spares.svelte";
  import Avatar from "../Avatar/index.svelte";
  import Clock from "./clock.svelte";

  export let icon: string;
  export let clock: {
    waiting: boolean;
    minutes: number;
    seconds: number;
  };
  export let color: cgtypes.Color;
  export let spares: any;

  const dispatch = createEventDispatcher();

  function forward(name: string, event: Event) {
    dispatch(name, (event as CustomEvent).detail);
  }
</script>

<div class="relative w-full my-1 pb-1/8">
  <div class="absolute table bottom-0 w-1/8 pb-1/8">
    <div class="absolute h-full bottom-0 flex flex-row" style="width: 800%;">
      <div class="bg-gray-200 border border-gray-400 inline-block w-1/8">
        <Avatar {icon} />
      </div>
      <div class="inline-block w-1/4">
        <Clock waiting="{clock.waiting}" minutes="{clock.minutes}" seconds="{clock.seconds}" />
      </div>
      <div class="bg-gray-200 border border-gray-400 flex" style="width: 62.5%;">
        <Spares
          on:dragNewPiece="{(e) => forward('spareDragNewPiece', e)}"
          {color}
          dropType="{spares.dropType}"
          dropPiece="{spares.dropPiece}"
          pawnCount="{spares.pawnCount}"
          knightCount="{spares.knightCount}"
          bishopCount="{spares.bishopCount}"
          rookCount="{spares.rookCount}"
          queenCount="{spares.queenCount}"
        />
      </div>
    </div>
  </div>
</div>
