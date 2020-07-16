import Home from "./pages/Home.svelte";
import Game from "./pages/Game/index.svelte";

type routeMeta = { location: string; path: string; title: string; component: any };

function location(routeMeta: routeMeta): [string, routeMeta] {
  return [routeMeta.location, routeMeta];
}

export const locationMap = new Map([
  location({ location: "/", path: "/", title: "Home", component: Home }),
  location({ location: "/lounge", path: "/lounge", title: "Lounge", component: Home }),
  location({ location: "/room", path: "/room", title: "Room", component: Home }),
  location({ location: "/game", path: "/game", title: "Game", component: Game }),
  location({ location: "/about", path: "/about", title: "About", component: Home }),
]);

export const pages = Array.from(locationMap).map(([_, routeMeta]) => {
  return routeMeta;
});

export const routes = new Map(
  Array.from(locationMap).map(([_, routeMeta]) => {
    return [routeMeta.path, routeMeta.component];
  })
);
