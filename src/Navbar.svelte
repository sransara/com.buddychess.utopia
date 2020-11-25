<script lang="typescript">
  import { link, location } from "svelte-spa-router";
  import { _roomId$, _playerId$ } from "./common/datastore";
  import { replace } from "svelte-spa-router";
</script>

<header class="px-1 py-1 flex bg-gray-800 text-gray-200 text-3xl whitespace-no-wrap w-full overflow-hidden">
  <span class="px-1 inline-block hover:text-yellow-600">
    <a class="flex items-center" href="/" use:link>
      <span class="rounded-full bg-blue-200 pb-2 pr-1 pl-1 mr-2"><img class="inline" alt="icon" src="/favicon.png" /></span>
      Buddy Chess</a>
  </span>
  {#if !$_roomId$}
    <button
      class="px-2 mx-2 inline-block bg-blue-500 hover:bg-blue-700 rounded-md focus:outline-none"
      on:click="{() => {
        replace('/room/create');
      }}"
    >
      Game room
    </button>
  {:else if $location.startsWith('/room') || $location.startsWith('/game')}
    <button
      class="px-2 mx-2 inline-block bg-blue-500 hover:bg-blue-700 rounded-md focus:outline-none"
      on:click="{() => {
        window.location.hash = '/';
        window.location.reload();
      }}"
    >
      Leave this game room
    </button>
  {:else}
    <button
      class="px-2 mx-2 inline-block bg-blue-500 hover:bg-blue-700 rounded-md focus:outline-none"
      on:click="{() => {
        if ($_playerId$ == 'host') {
          replace(`/room/create/${$_roomId$}`);
        } else {
          replace(`/room/join/${$_roomId$}`);
        }
      }}"
    >
      Back to game room
    </button>
  {/if}
</header>
