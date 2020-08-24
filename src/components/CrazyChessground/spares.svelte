<script lang="typescript">
  import { createEventDispatcher } from "svelte";

  import Piece from "../Piece.svelte";

  import { Api } from "chessground/api";
  import * as cgtypes from "chessground/types";

  export let color: cgtypes.Color;
  export let dropType: "predrop" | "drop" | undefined;
  export let dropPiece: cgtypes.Role | undefined;
  export let pawn: number;
  export let knight: number;
  export let bishop: number;
  export let rook: number;
  export let queen: number;

  const dispatch = createEventDispatcher();

  function dragNewPiece(event: any) {
    // only touch or left click
    if (event.button !== undefined && event.button !== 0) return;
    // support one finger touch only
    if (event.touches && event.touches.length > 1) return;
    let element: HTMLSpanElement = event.currentTarget;
    const count = element.getAttribute("data-count");
    const role = element.getAttribute("data-role") as cgtypes.Role;
    const color = element.getAttribute("data-color") as cgtypes.Color;

    dispatch("dragNewPiece", {
      pieceRole: role,
      pieceColor: color,
      pieceCount: count,
      event: event,
    });
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
    right: 10%;
    position: absolute;
    padding: 0 0.5vw;
    font-weight: bold;
    font-size: 1vw;
    background: #d64f00;
    color: #fff;
  }

  .drop {
    /* from _cgboard.css */
    background-color: rgb(155, 199, 0);
  }

  .predrop {
    /* from _cgboard.css */
    background-color: rgb(20, 30, 85);
  }
</style>

<span
  class="h-full w-1/5 inline-block relative"
  class:drop="{dropType == 'drop' && dropPiece == 'pawn'}"
  class:predrop="{dropType == 'predrop' && dropPiece == 'pawn'}"
  data-role="pawn"
  data-color="{color}"
  data-count="{pawn}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
>
  <Piece role="pawn" {color} />
</span>

<span
  class="h-full w-1/5 inline-block relative"
  class:drop="{dropType == 'drop' && dropPiece == 'knight'}"
  class:predrop="{dropType == 'predrop' && dropPiece == 'knight'}"
  data-role="knight"
  data-color="{color}"
  data-count="{knight}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
>
  <Piece role="knight" {color} />
</span>

<span
  class="h-full w-1/5 inline-block relative"
  class:drop="{dropType == 'drop' && dropPiece == 'bishop'}"
  class:predrop="{dropType == 'predrop' && dropPiece == 'bishop'}"
  data-role="bishop"
  data-color="{color}"
  data-count="{bishop}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
>
  <Piece role="bishop" {color} />
</span>

<span
  class="h-full w-1/5 inline-block relative"
  class:drop="{dropType == 'drop' && dropPiece == 'rook'}"
  class:predrop="{dropType == 'predrop' && dropPiece == 'rook'}"
  data-role="rook"
  data-color="{color}"
  data-count="{rook}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
>
  <Piece role="rook" {color} />
</span>

<span
  class="h-full w-1/5 inline-block relative"
  class:drop="{dropType == 'drop' && dropPiece == 'queen'}"
  class:predrop="{dropType == 'predrop' && dropPiece == 'queen'}"
  data-role="queen"
  data-color="{color}"
  data-count="{queen}"
  on:mousedown="{dragNewPiece}"
  on:touchstart="{dragNewPiece}"
>
  <Piece role="queen" {color} />
</span>
