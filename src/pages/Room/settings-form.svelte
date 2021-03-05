<script lang="typescript">
  export let readonly: boolean;
  export let minsPerSide: number;
</script>

<div class="w-full text-base">
  <div class="w-full mb-3">
    <label for="minsPerSide" class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">Time control</label>
    <select
      class="block w-full border py-1 px-1 rounded"
      disabled="{readonly}"
      id="minsPerSide"
      bind:value="{minsPerSide}"
    >
      {#each [3, 5, 10, 15] as min}
        <option value="{min}">{min} minutes per side</option>
      {/each}
    </select>
  </div>
  <slot />
</div>
