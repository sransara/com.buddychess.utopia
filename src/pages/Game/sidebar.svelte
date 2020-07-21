<script lang="typescript">
  // @ts-ignore
  export let sidebar: HTMLElement = undefined;
</script>

<div bind:this="{sidebar}" class="flex flex-col my-1 mr-2" style="width: 16.67vw;">
  <div class="container mb-1 border border-gray-400">
    <div class="p-1 bg-gray-800 text-gray-200 whitespace-no-wrap">Room overview</div>
    <div></div>
  </div>
  <div class="container mb-1 border border-gray-400">
    <div class="p-1 bg-gray-800 text-gray-200 whitespace-no-wrap">Actions</div>
    <div></div>
  </div>
  <div class="flex-grow container border border-gray-400">
    <div class="p-1 bg-gray-800 text-gray-200 whitespace-no-wrap">Chat</div>
    <div></div>
  </div>
</div>
