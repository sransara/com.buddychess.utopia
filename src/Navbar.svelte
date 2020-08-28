<script lang="typescript">
  import { link, location } from "svelte-spa-router";
  import { _roomId$ } from "./common/datastore";
</script>

<header
  class="px-1 py-1 flex bg-gray-800 text-gray-200 text-3xl whitespace-no-wrap w-full overflow-hidden"
  style="min-width: 75rem;"
>
  <span class="px-1 inline-block hover:text-yellow-600">
    <a class="inline-block" href="/" use:link>&#x2658;Buddy Chess</a>
  </span>
  <span class="px-2 mx-2 inline-block bg-blue-500 hover:bg-blue-700 rounded-md">
    {#if !$_roomId$}
      <a class="inline-block" href="/room/create" use:link>Create a room</a>
    {:else}
      <button
        class="inline-block focus:outline-none"
        on:click="{() => {
          window.location.hash = '/';
          window.location.reload();
        }}"
      >
        Leave Room
      </button>
    {/if}
  </span>
</header>
