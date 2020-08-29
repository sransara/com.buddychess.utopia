<script lang="typescript">
  import * as errors from "../common/errors";
  import { replace } from "svelte-spa-router";

  export let params: any = {};
</script>

<div class="bg-white prose items-center justify-center flex flex-col h-full w-full max-w-full">
  <h1 style="margin: 0;">Opps something went wrong</h1>
  <h2 style="margin: 1em 0px;">{errors.fatalMsg[params.id]}</h2>
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white text-xl px-2 py-1 ml-2 rounded-lg focus:outline-none"
    on:click="{() => replace('/')}"
  >
    Go back to home page
  </button>
</div>
