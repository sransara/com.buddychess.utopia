import Home from "./pages/Home.svelte";
import Room from "./pages/Room/index.svelte";
import Game from "./pages/Game/index.svelte";
import { wrap } from "svelte-spa-router";

type routeMeta = { location: string; path: string; component: any; title: string };

export const menu: routeMeta[] = [
  { location: "/", path: "/", component: Home, title: "Home" },
  { location: "/room", path: "/room/:id?", component: Room, title: "Room" },
];

export const pages = [...menu, ...[{ location: "/game", path: "/game/:id", component: Game, title: "Game" }]];

export const routes = new Map(pages.map((page) => [page.path, wrap(page.component, page)]));
