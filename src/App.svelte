<script lang="typescript">
  import Router from "svelte-spa-router";
  import { location } from "svelte-spa-router";
  import { routes } from "./routes";

  import Navbar from "./Navbar.svelte";

  let openSidebar = false;
  let currentRoute: any = { title: "Home", location: "/" };
  function routeLoaded(event: any): any {
    openSidebar = false;
    currentRoute = event.detail.userData;
  }
</script>

<svelte:head>
  <title>Buddy Chess: {currentRoute.title}</title>
</svelte:head>

<Navbar bind:openSidebar route="{currentRoute}" />
<Router {routes} on:routeLoaded="{routeLoaded}" />
