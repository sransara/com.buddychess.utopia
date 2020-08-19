<script lang="typescript">
  import Avatar from "../../components/Avatar/index.svelte";

  import * as global from "../../common/dataglobal";

  export let readonly: boolean;
  export let name: string = "";
  export let avatar: string = "";
  export let team: string = "";
  export let errors: string[] = [];
</script>

<div class="w-full text-base">
  <div class="w-full mb-3">
    <label for="name" class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">Name</label>
    <input
      id="name"
      bind:value="{name}"
      disabled="{readonly}"
      class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4
      leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      type="text"
      maxlength="{5}"
    />
  </div>
  <div class="w-full mb-3">
    <div class="flex space-x-4">
      <div class="flex-grow">
        <span class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">Avatar</span>
        {#each global.avatars as _avatar}
          <div class="flex items-center">
            <input
              type="radio"
              id="{_avatar}"
              name="avatar"
              bind:group="{avatar}"
              value="{_avatar}"
              disabled="{readonly}"
            />
            <label class="text-gray-700 ml-2 flex-grow" for="{_avatar}">{_avatar}</label>
          </div>
        {/each}
      </div>
      <div class="flex-grow">
        <span class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">Team</span>
        {#each global.teams as _team}
          <div class="flex items-center">
            <input type="radio" id="{_team}" name="team" bind:group="{team}" value="{_team}" disabled="{readonly}" />
            <label class="text-gray-700 ml-2 flex-grow" for="{_team}">{_team}</label>
          </div>
        {/each}
      </div>
      <div class="flex-grow">
        <div class="w-full h-full flex items-center justify-center">
          <div class="w-20 h-20 mt-4 p-2 {team == 'red' ? 'bg-red-300' : ''} {team == 'blue' ? 'bg-blue-300' : ''}">
            <Avatar icon="{avatar}" />
          </div>
        </div>
      </div>
    </div>
    {#each errors as error}
      <p class="text-red-500 text-sm font-bold my-1">{error}</p>
    {/each}
  </div>
  <slot />
</div>
