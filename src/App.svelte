<script lang="typescript">
  import GlobalStyles from "./components/GlobalStyles.svelte";
  import GithubCorner from "./components/GithubCorner.svelte";
  import Router from "svelte-spa-router";
  import { routes } from "./routes";
  import Navbar from "./Navbar.svelte";
  import EventBus from "./EventBus.svelte";
  import Sidebar from "./Sidebar.svelte";

  let currentRoute: any = { title: "Home", location: "/" };
  function routeLoaded(event: any): any {
    currentRoute = event.detail.userData;
  }
</script>

<svelte:head>
  <title>Buddy Chess: {currentRoute.title}</title>
</svelte:head>

<EventBus />
<div class="flex flex-col" style="min-width: 75rem;">
  <Navbar />
  <GithubCorner url="https://github.com/sransara/buddy-chess-utopia" />

  <div class="flex" style="min-height: 24rem;">
    <div class="w-4/5">
      <Router {routes} on:routeLoaded="{routeLoaded}" />
    </div>
    <div class="w-1/5">
      <Sidebar />
    </div>
  </div>
</div>
