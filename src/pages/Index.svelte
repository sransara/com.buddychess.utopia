<script lang="typescript">
  import { link } from "svelte-spa-router";
</script>

<style>
  a {
    color: blue;
  }
</style>

<a href="/game" use:link>Go to game page</a>
