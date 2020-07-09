<script lang="typescript">
  import { Api } from "chessground/api";
  import * as cgtypes from "chessground/types";

  export let isMyChessground: boolean;
  export let chessground: Api;
  export let color: cgtypes.Color;
  export let pawnCount: number;
  export let knightCount: number;
  export let bishopCount: number;
  export let rookCount: number;
  export let queenCount: number;

  function dragNewPiece(event: any) {
    if (event.button !== undefined && event.button !== 0) return; // only touch or left click
    if (event.touches && event.touches.length > 1) return; // support one finger touch only
    if (!isMyChessground) return;

    let element: HTMLSpanElement = event.target;
    const count = element.getAttribute("data-count");
    if (count === "0") return;

    const role = element.getAttribute("data-role") as cgtypes.Role;
    const color = element.getAttribute("data-color") as cgtypes.Color;
    chessground.dragNewPiece({ role: role, color: color }, event);
  }
</script>

<style>
  span[data-count="0"] {
    opacity: 0.3;
  }

  span:not([data-count="0"]) {
    opacity: 1;
  }

  span:not([data-count="0"])::after {
    content: attr(data-count);
    bottom: 5%;
    right: 15%;
    position: absolute;
    padding: 0 0.5vw;
    font-weight: bold;
    font-size: 1vw;
    background: #d64f00;
    color: #fff;
  }
</style>

<span
  class="h-full w-1/5 bg-cover inline-block relative cg-piece pawn {color}"
  data-role="pawn"
  data-color="{color}"
  data-count="{pawnCount}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
></span>

<span
  class="h-full w-1/5 bg-cover inline-block relative cg-piece knight {color}"
  data-role="knight"
  data-color="{color}"
  data-count="{knightCount}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
></span>

<span
  class="h-full w-1/5 bg-cover inline-block relative cg-piece bishop {color}"
  data-role="bishop"
  data-color="{color}"
  data-count="{bishopCount}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
></span>

<span
  class="h-full w-1/5 bg-cover inline-block relative cg-piece rook {color}"
  data-role="rook"
  data-color="{color}"
  data-count="{rookCount}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
></span>

<span
  class="h-full w-1/5 bg-cover inline-block relative cg-piece queen {color}"
  data-role="queen"
  data-color="{color}"
  data-count="{queenCount}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
></span>
