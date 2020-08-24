<script lang="typescript">
  import { createEventDispatcher } from "svelte";

  import { Api } from "chessground/api";
  import * as cgtypes from "chessground/types";

  import Spares from "./spares.svelte";
  import Avatar from "../Avatar/index.svelte";
  import Clock from "./clock.svelte";

  import * as global from "../../common/dataglobal";

  export let name: string;
  export let avatar: string;
  export let team: string;

  export let clock: {
    state: string;
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
      <div class="{global.teambg[team]} w-1/8 flex flex-col items-center justify-center">
        <span class="inline-block text-xs">{name}</span>
        <Avatar {avatar} />
      </div>
      <div class="inline-block border border-gray-800 w-1/4 cursor-default">
        <Clock state="{clock.state}" minutes="{clock.minutes}" seconds="{clock.seconds}" />
      </div>
      <div class="bg-gray-200 border border-gray-400 flex" style="width: 62.5%;">
        <Spares
          on:dragNewPiece="{(e) => forward('spareDragNewPiece', e)}"
          {color}
          dropType="{spares.dropType}"
          dropRole="{spares.dropRole}"
          pawn="{spares.pawn}"
          knight="{spares.knight}"
          bishop="{spares.bishop}"
          rook="{spares.rook}"
          queen="{spares.queen}"
        />
      </div>
    </div>
  </div>
</div>
