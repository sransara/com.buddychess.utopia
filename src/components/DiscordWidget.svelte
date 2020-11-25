<script lang="typescript">
  import { onMount } from "svelte";

  export let name: string;
  export let inviteURL: string;
  export let widgetURL: string;

  let presenceCount: number = NaN;

  onMount(async function () {
    const response = await fetch(widgetURL);
    const data = await response.json();
    presenceCount = data.presence_count;
  });
</script>

<div class="flex border border-blue-700 p-2 rounded-md items-center">
  <div class="mr-2"><img src="/favicon.png" alt="favicon" /></div>
  <div>
    <a class="underline" target="_blank" rel="noopener noreferrer" href="{inviteURL}">Join the {name} discord</a>
    <br />
    {presenceCount} online
  </div>
</div>
