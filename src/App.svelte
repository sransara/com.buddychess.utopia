<script lang="typescript">
  import Navbar from "./Navbar.svelte";
  import Router from "svelte-spa-router";
  import { location } from "svelte-spa-router";
  import { locationMap, routes } from "./routes";

  let openSidebar = false;

  function closeSidebar() {
    openSidebar = false;
  }
</script>

<svelte:head>
  <title>Buddy Chess: {locationMap.get($location)?.title}</title>
</svelte:head>
<Navbar bind:openSidebar />
<Router {routes} on:routeLoaded="{closeSidebar}" />
