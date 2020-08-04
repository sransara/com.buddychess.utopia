<script lang="typescript">
  import { link, location } from "svelte-spa-router";
  import { fly } from "svelte/transition";
  import { menu } from "./routes";

  export let openSidebar: boolean;
  export let route: any;

  function toggleOpenSidebar() {
    openSidebar = !openSidebar;
  }
</script>

<style>

</style>

<header class="flex bg-gray-800 text-gray-200 text-3xl whitespace-no-wrap w-full">
  <button class="cursor-pointer focus:outline-none" on:click="{toggleOpenSidebar}">
    <span class="text-gray-500 hover:text-gray-400">
      {#if !openSidebar}☰{:else}☷{/if}
    </span>
    Buddy Chess
  </button>
  : {route.title}
</header>

{#if openSidebar}
  <aside transition:fly class="z-10 absolute bg-gray-800 text-gray-500 border-t border-gray-600 text-3xl w-64">
    {#each menu as page}
      <a
        class="block hover:text-gray-200 {page.location == route.location ? 'text-gray-200' : ''}"
        href="{page.location}"
        use:link
      >
        ☞ {page.title}
      </a>
    {/each}
  </aside>
{/if}
