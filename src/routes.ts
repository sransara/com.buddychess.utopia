import Home from "./pages/Home.svelte";
import Error from "./pages/Error.svelte";
import RoomCreate from "./pages/Room/Create.svelte";
import RoomJoin from "./pages/Room/Join.svelte";
import Game from "./pages/Game/index.svelte";
import { wrap } from "svelte-spa-router";

type routeMeta = { location: string; path: string; component: any; title: string };

export const pages: routeMeta[] = [
  { location: "/", path: "/", component: Home, title: "Home" },
  { location: "/room/create", path: "/room/create/:id?", component: RoomCreate, title: "Create Room" },
  { location: "/room/join", path: "/room/join/:id", component: RoomJoin, title: "Join Room" },
  { location: "/game", path: "/game/:action/:id", component: Game, title: "Game" },
  { location: "/error", path: "/error/:id", component: Error, title: "Error" },
];

export const routes = new Map(pages.map((page) => [page.path, wrap(page.component, page)]));
