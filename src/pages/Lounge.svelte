<script lang="typescript">
  import { fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let isCreatingPublicRoom = false;
  let isJoiningPublicRoom = false;
  let isCreatingPrivateRoom = false;
  let isJoiningPrivateRoom = false;
</script>

<style>
  .active {
    @apply text-2xl;
  }
</style>

<div class="p-1">
  <ul class="flex mb-3 text-lg">
    <li class="mr-3">
      <button
        class="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 focus:outline-none"
        class:active="{isCreatingPublicRoom}"
        on:click="{() => {
          isCreatingPublicRoom = true;
          isJoiningPublicRoom = false;
          isCreatingPrivateRoom = false;
          isJoiningPrivateRoom = false;
        }}"
      >
        Create new public room
      </button>
    </li>
    <li class="mr-3">
      <button
        class="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 focus:outline-none"
        class:active="{isJoiningPublicRoom}"
        on:click="{() => {
          isCreatingPublicRoom = false;
          isJoiningPublicRoom = true;
          isCreatingPrivateRoom = false;
          isJoiningPrivateRoom = false;
        }}"
      >
        Join a public room
      </button>
    </li>
    <li class="mr-3">
      <button
        class="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 focus:outline-none"
        class:active="{isCreatingPrivateRoom}"
        on:click="{() => {
          isCreatingPublicRoom = false;
          isJoiningPublicRoom = false;
          isCreatingPrivateRoom = true;
          isJoiningPrivateRoom = false;
        }}"
      >
        Create new private room
      </button>
    </li>
    <li class="mr-3">
      <button
        class="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 focus:outline-none"
        class:active="{isJoiningPrivateRoom}"
        on:click="{() => {
          isCreatingPublicRoom = false;
          isJoiningPublicRoom = false;
          isCreatingPrivateRoom = false;
          isJoiningPrivateRoom = true;
        }}"
      >
        Join a private room
      </button>
    </li>
  </ul>
  {#if isCreatingPublicRoom}
    <div class="w-full" in:fade></div>
  {:else if isJoiningPublicRoom}
    <div class="w-full" in:fade></div>
  {:else if isCreatingPrivateRoom}
    <div class="w-full" in:fade></div>
  {:else if isJoiningPrivateRoom}
    <div class="w-full" in:fade></div>
  {/if}
</div>
