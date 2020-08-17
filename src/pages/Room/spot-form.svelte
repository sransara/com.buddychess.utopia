<script lang="typescript">
  import { avatarIcons, teamColors } from "../../common/dataglobal";
  import Avatar from "../../components/Avatar/index.svelte";

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
        {#each avatarIcons as avatarIcon}
          <div class="flex items-center">
            <input
              type="radio"
              id="{avatarIcon}"
              name="avatarIcon"
              bind:group="{avatar}"
              value="{avatarIcon}"
              disabled="{readonly}"
            />
            <label class="text-gray-700 ml-2 flex-grow" for="{avatarIcon}">{avatarIcon}</label>
          </div>
        {/each}
      </div>
      <div class="flex-grow">
        <span class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-1">Team</span>
        {#each teamColors as teamColor}
          <div class="flex items-center">
            <input
              type="radio"
              id="{teamColor}"
              name="teamColor"
              bind:group="{team}"
              value="{teamColor}"
              disabled="{readonly}"
            />
            <label class="text-gray-700 ml-2 flex-grow" for="{teamColor}">{teamColor}</label>
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
