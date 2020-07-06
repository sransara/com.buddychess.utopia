<script lang="typescript">
  import { onMount, onDestroy } from "svelte";

  import { Chessground } from "chessground";
  import { Config } from "chessground/config";
  import { Api } from "chessground/api";

  export let config: Config;
  //@ts-ignore
  export let chessground: Api = undefined;

  const defaultCgconfig: Config = {
    disableContextMenu: true,
    drawable: {
      enabled: false,
    },
  };

  let cgdiv: any;
  onMount(() => {
    chessground = Chessground(cgdiv, { ...defaultCgconfig, ...config });
  });

  onDestroy(() => {
    chessground.destroy();
  });
</script>

<style global>
  @import "./chessground.css";
</style>

<div bind:this="{cgdiv}"></div>
