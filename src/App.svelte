<script lang="typescript">
  import Navbar from "./Navbar.svelte";
  import Router from "svelte-spa-router";
  import { routes } from "./routes";

  let openSidebar = false;

  function closeSidebar() {
    openSidebar = false;
  }
</script>

<Navbar bind:openSidebar />
<Router {routes} on:routeLoaded="{closeSidebar}" />
