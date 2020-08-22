<script lang="typescript">
  import Avatar from "../../components/Avatar/index.svelte";
  export let name: string;
  export let team: string;
  export let avatar: string;
</script>

<span class="h-10 w-10 mr-2 p-1 {team == 'red' ? 'bg-red-300' : ''} {team == 'blue' ? 'bg-blue-300' : ''}">
  <Avatar {avatar} />
</span>
<span>{name}</span>
