<script lang="typescript">
  import { fade } from "svelte/transition";

  import Avatar from "../../components/Avatar/index.svelte";
  import Piece from "../../components/Piece.svelte";

  import * as cgtypes from "chessground/types";

  export let aInteractive: cgtypes.Color | false;
  export let aOrientation: cgtypes.Color;
  export let aWhiteAvatar: string;
  export let aBlackAvatar: string;

  export let bInteractive: cgtypes.Color | false;
  export let bOrientation: string;
  export let bWhiteAvatar: string;
  export let bBlackAvatar: string;

  let aTopColor: cgtypes.Color;
  let aTopAvatar: string;
  $: aTopColor = aOrientation == "white" ? "black" : "white";
  $: aTopAvatar = aTopColor == "white" ? aWhiteAvatar : aBlackAvatar;

  let aBottomColor: cgtypes.Color;
  let aBottomAvatar: string;
  $: aBottomColor = aOrientation == "white" ? "white" : "black";
  $: aBottomAvatar = aBottomColor == "white" ? aWhiteAvatar : aBlackAvatar;

  let bTopColor: cgtypes.Color;
  let bTopAvatar: string;
  $: bTopColor = bOrientation == "white" ? "black" : "white";
  $: bTopAvatar = bTopColor == "white" ? bWhiteAvatar : bBlackAvatar;

  let bBottomColor: cgtypes.Color;
  let bBottomAvatar: string;
  $: bBottomColor = bOrientation == "white" ? "white" : "black";
  $: bBottomAvatar = bBottomColor == "white" ? bWhiteAvatar : bBlackAvatar;
</script>
