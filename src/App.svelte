<script lang="typescript">
  import Router from "svelte-spa-router";
  import { location, replace } from "svelte-spa-router";
  import { routes } from "./routes";
  import { onMount, onDestroy, tick } from "svelte";
  import Navbar from "./Navbar.svelte";
  import { EventBusSingleton as EventBus } from "light-event-bus";
  import { roomId$, playerId$, spots$, wizard$, gamen$, crazy$, acg$, bcg$ } from "./common/datastore";
  import { initPeerKey, setupPeerConnection, allSpotsInSync } from "./pages/Room/common";
  import { dbrest } from "./common/firebase";
  import * as global from "./common/dataglobal";
  import * as msgbus from "./common/msgbus";
  import * as wizard from "./common/wizard";

  let openSidebar = false;
  let currentRoute: any = { title: "Home", location: "/" };
  function routeLoaded(event: any): any {
    openSidebar = false;
    currentRoute = event.detail.userData;
  }

  onMount(() => {
    // Room
    EventBus.subscribe("simplePeerSignal", async (arg: any) => {
      const peerId = arg.from;
      global.players[peerId]["peerConnection"].signal(arg.payload);
    });

    // Room/Create
    EventBus.subscribe("initPeerConnection", async (arg: any) => {
      if ($playerId$ != "host") return;

      const peerId = arg.from;
      if ("peerConnection" in global.players[peerId]) return;
      await initPeerKey(global.players, $roomId$, peerId);
      await setupPeerConnection(global.players, $roomId$, $playerId$, peerId);
    });

    EventBus.subscribe("saveSpot", (arg: any) => {
      if ($playerId$ != "host") return;

      const peerId = arg.from;
      const spot = arg.payload;
      let errors: string[] = [];
      const spotskeys = Object.keys($spots$).filter((pid: string) => pid != peerId);

      if (spotskeys.filter((pid: string) => $spots$[pid]["name"] == spot["name"]).length > 0) {
        errors = [...errors, `Name: ${spot["name"]} is taken at the moment.`];
      }

      if (spotskeys.filter((pid: string) => $spots$[pid]["avatar"] == spot["avatar"]).length > 0) {
        errors = [...errors, `Avatar: ${spot["avatar"]} is taken at the moment.`];
      }

      if (spotskeys.filter((pid: string) => $spots$[pid]["team"] == spot["team"]).length >= 2) {
        errors = [...errors, `Team: ${spot["team"]} is full at the moment.`];
      }

      if (spotskeys.length >= 4) {
        errors = ["Sorry. this room is full at the moment."];
      }

      if (!errors.length) {
        $spots$[peerId] = spot;
        $spots$ = $spots$;
      }
      msgbus.send(global.players, $roomId$, $playerId$, peerId, "saveSpotAck", {
        errors: errors,
        gamen: $gamen$,
        spots: $spots$,
      });
    });

    EventBus.subscribe("updatedSpots", () => {
      if ($playerId$ != "host") return;

      if (wizard.isIn($wizard$, wizard.steps.WAIT_FOR_SPOTS, "doing")) {
        if (allSpotsInSync($spots$, $wizard$, $gamen$ + 1)) {
          dbrest(`rooms/${$roomId$}/status.json`, { method: "PUT", body: '"full"' });
          $wizard$ = wizard.next($wizard$);
          $gamen$ = $gamen$ + 1;
          replace(`/game/create/${$roomId$}`);
        }
      } else if (wizard.isAfter($wizard$, wizard.steps.WAIT_FOR_SPOTS)) {
        if (Object.keys($spots$).length != 4) {
          $wizard$ = wizard.todo(wizard.steps.WAIT_FOR_SPOTS);
          replace(`/room/create/${$roomId$}`);
        }
      }
    });

    EventBus.subscribe("updateSpot", async (arg: any) => {
      if ($playerId$ != "host") return;

      $spots$[arg.from] = arg.payload[arg.from];
      $spots$ = $spots$;
      msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "updateSpots", $spots$);
      EventBus.publish("updatedSpots");
    });

    EventBus.subscribe("deletePlayer", async (pid: any) => {
      if ($playerId$ != "host") return;

      if (pid in $spots$) {
        delete $spots$[pid];
        $spots$ = $spots$;
        msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "updateSpots", $spots$);
        EventBus.publish("updatedSpots");
      }
    });

    // Room/Join
    EventBus.subscribe("initPeerConnection", async (arg: any) => {
      if ($playerId$ == "host") return;

      const peerId = arg.from;
      if ("peerConnection" in global.players[peerId]) return;
      await setupPeerConnection(global.players, $roomId$, $playerId$, peerId);
    });

    EventBus.subscribe("deletePlayer", (pid: any) => {
      if ($playerId$ == "host") return;

      if (pid == "host") {
        alert("Disconnected from the host!");
        replace(`/game/join/${$roomId$}`);
        window.location.reload();
      }
    });

    EventBus.subscribe("updatedSpots", () => {
      if ($playerId$ == "host") return;

      if (wizard.isIn($wizard$, wizard.steps.WAIT_FOR_SPOTS, "doing")) {
        if (allSpotsInSync($spots$, $wizard$, $gamen$ + 1)) {
          $wizard$ = wizard.next($wizard$);
          $gamen$ = $gamen$ + 1;
          replace(`/game/join/${$roomId$}`);
        }
      } else if (wizard.isAfter($wizard$, wizard.steps.WAIT_FOR_SPOTS)) {
        if (Object.keys($spots$).length != 4) {
          $wizard$ = wizard.todo(wizard.steps.WAIT_FOR_SPOTS);
          replace(`/room/join/${$roomId$}`);
        }
      }
    });

    EventBus.subscribe("updateSpots", async (arg: any) => {
      if ($playerId$ == "host") return;

      $spots$ = arg.payload;
      Object.keys($spots$).forEach(async (peerId) => {
        if (peerId == $playerId$) return;
        if ($playerId$ < peerId) return;
        // only non-polite will initiate connection
        if ("peerConnection" in global.players[peerId]) return;
        await setupPeerConnection(global.players, $roomId$, $playerId$, peerId);
      });
      EventBus.publish("updatedSpots");
    });

    // Game
    EventBus.subscribe("updatedSpots", (arg: any) => {
      if (wizard.isIn($wizard$, wizard.steps.WAIT_FOR_GAME, "doing")) {
        if (allSpotsInSync($spots$, $wizard$, $gamen$)) {
          $wizard$ = wizard.next($wizard$);
        }
      }
    });

    EventBus.subscribe("afterMove", (arg: any) => {
      const move = arg.payload;
      if (move.fromId == $crazy$[$playerId$]["opId"]) {
        $bcg$["fen"] = move["fen"];
        $bcg$["lastMove"] = move["lastMove"];
        $bcg$ = $bcg$;
      } else {
        $acg$["fen"] = move["fen"];
        $acg$["lastMove"] = move["lastMove"];
        $acg$ = $acg$;
      }

      if (move.spare) $crazy$[$crazy$[move.fromId]["buddyId"]]["spares"][move.spare] += 1;

      $crazy$[move.fromId]["spares"]["dropType"] = undefined;
      $crazy$[move.fromId]["spares"]["dropRole"] = undefined;
      $crazy$[$crazy$[move.fromId]["opId"]]["spares"]["dropType"] = undefined;
      $crazy$[$crazy$[move.fromId]["opId"]]["spares"]["dropRole"] = undefined;

      $crazy$[move.fromId]["clock"] = move["clock"];
      $crazy$[$crazy$[move.fromId]["opId"]]["clock"]["state"] = "active";

      $crazy$ = $crazy$;
    });

    EventBus.subscribe("afterNewPieceMove", (arg: any) => {
      const move = arg.payload;
      if (move.fromId == $crazy$[$playerId$]["opId"]) {
        $bcg$["fen"] = move["fen"];
        $bcg$["lastMove"] = move["lastMove"];
        $bcg$ = $bcg$;
      } else {
        $acg$["fen"] = move["fen"];
        $acg$["lastMove"] = move["lastMove"];
        $acg$ = $acg$;
      }

      if (move.spare) $crazy$[move.fromId]["spares"][move.spare] -= 1;

      $crazy$[move.fromId]["spares"]["dropType"] = "drop";
      $crazy$[move.fromId]["spares"]["dropRole"] = move.spare;
      $crazy$[$crazy$[move.fromId]["opId"]]["spares"]["dropType"] = undefined;
      $crazy$[$crazy$[move.fromId]["opId"]]["spares"]["dropRole"] = undefined;

      $crazy$[move.fromId]["clock"] = move["clock"];
      $crazy$[$crazy$[move.fromId]["opId"]]["clock"]["state"] = "active";

      $crazy$ = $crazy$;
    });
  });
</script>

<svelte:head>
  <title>Buddy Chess: {currentRoute.title}</title>
</svelte:head>

<Navbar bind:openSidebar route="{currentRoute}" />
<Router {routes} on:routeLoaded="{routeLoaded}" />
