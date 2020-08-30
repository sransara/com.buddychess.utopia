<script lang="typescript">
  import BuddyChessground from "../../components/BuddyChessground.svelte";
  import Sidebar from "../../Sidebar.svelte";
  import Splash from "./splash.svelte";
  import { onMount, onDestroy } from "svelte";
  import { replace } from "svelte-spa-router";
  import { EventBusSingleton as EventBus } from "light-event-bus";

  import {
    _roomId$,
    roomId$,
    _playerId$,
    playerId$,
    spots$,
    wizard$,
    gamen$,
    crazy$,
    acg$,
    bcg$,
  } from "../../common/datastore";
  import * as global from "../../common/dataglobal";
  import * as msgbus from "../../common/msgbus";
  import * as wizard from "../../common/wizard";
  import * as utils from "../../common/utils";

  import * as chessx from "./chessx";
  import { Api } from "chessground/api";
  import { Config } from "chessground/config";
  import * as cgtypes from "chessground/types";
  import { Chess } from "chess.js";
  import * as chtypes from "chess.js";

  export let params: any = {};

  $: if (wizard.isAfter($wizard$, wizard.steps.WAIT_FOR_SPOTS)) {
    if ($playerId$ == "host") {
      if (params.action != "create" || params.id != $roomId$) {
        replace(`/game/create/${$roomId$}`);
      }
    } else if (params.action != "join" || params.id != $roomId$) {
      replace(`/game/join/${$roomId$}`);
    }
  } else if ($_roomId$ && $_playerId$) {
    if ($_playerId$ == "host") {
      replace(`/room/create/${$_roomId$}`);
    } else {
      replace(`/room/join/${$_roomId$}`);
    }
  } else {
    replace("/");
  }

  // just a hacky way to fit the game view to window sizes
  // - resize game view to fill window height
  // - but make sure not to overflow on the x-axis
  // - TODO: make sure a square is not too big
  let visibleSplash = true;
  // @ts-ignore
  let buddyChessground: HTMLElement = undefined;
  function fitViewport() {
    // assume scroll bar width: 15
    const rect = buddyChessground.getBoundingClientRect();
    const windowHeight = Math.max(window.innerHeight, utils.convertRemToPixels(24));
    const nextH = Math.floor(window.innerHeight - utils.convertRemToPixels(5));
    const currentW = rect.right - rect.left;
    const currentH = rect.bottom - rect.top;
    let nextW = (nextH * currentW) / currentH;
    const windowWidth = Math.max(window.innerWidth, utils.convertRemToPixels(75));
    const maxW = (windowWidth * 4) / 5 - 15;
    nextW = Math.min(nextW, maxW);
    buddyChessground.style.width = `${Math.floor(nextW)}px`;
  }

  onMount(async () => {
    window.addEventListener("resize", fitViewport);
    await utils.sleep(2000);
    fitViewport();
    if (wizard.isAfter($wizard$, wizard.steps.WAIT_FOR_GAME)) visibleSplash = false;
  });

  onDestroy(() => {
    window.removeEventListener("resize", fitViewport);
  });

  const colors: cgtypes.Color[] = $gamen$ % 2 == 0 ? ["white", "black"] : ["black", "white"];
  const spids = Object.keys($spots$).sort();

  const myTeam = spids.filter((pid) => $spots$[pid]["team"] == $spots$[$playerId$]["team"]);
  const opTeam = spids.filter((pid) => $spots$[pid]["team"] != $spots$[$playerId$]["team"]);
  const myColor = colors[myTeam.indexOf($playerId$)];
  const opColor = myColor == "white" ? "black" : "white";
  const myId = $playerId$;
  const opId = opTeam[colors.indexOf(opColor)];
  const buddyColor = opColor;
  const buddyId = myTeam[colors.indexOf(buddyColor)];
  const opBuddyColor = myColor;
  const opBuddyId = opTeam[colors.indexOf(opBuddyColor)];

  const aChess = new Chess();
  const bChess = new Chess();

  let aInteractive: cgtypes.Color | false = false;
  let bInteractive: cgtypes.Color | false = myColor;

  const seating: any = {
    b: {
      [myColor]: myId,
      [opColor]: opId,
    },
    a: {
      [buddyColor]: buddyId,
      [opBuddyColor]: opBuddyId,
    },
  };

  // @ts-ignore
  let aChessground: Api = undefined;
  // @ts-ignore
  let bChessground: Api = undefined;

  const aChessgroundConfig: Config = {
    orientation: opColor,
    viewOnly: true,
  };

  const bChessgroundConfig: Config = {
    orientation: myColor,
    movable: {
      color: myColor,
      free: false,
    },
    animation: {
      duration: 500,
    },
    draggable: {
      enabled: true,
      showGhost: true,
    },
    premovable: {
      enabled: false,
    },
    predroppable: {
      enabled: false,
    },
  };

  const initClockState = () => ({
    state: "stopped",
    minutes: 3,
    seconds: 0,
  });

  const initSparesState = () => ({
    dropType: undefined,
    dropRole: undefined,
    pawn: 0,
    knight: 0,
    bishop: 0,
    rook: 0,
    queen: 0,
  });

  $crazy$ = {
    [buddyId]: {
      spares: utils.getAttr($crazy$, [buddyId, "spares"], initSparesState),
      clock: utils.getAttr($crazy$, [buddyId, "clock"], initClockState),
      opId: opBuddyId,
      buddyId: myId,
      opBuddyId: opId,
    },
    [opBuddyId]: {
      spares: utils.getAttr($crazy$, [opBuddyId, "spares"], initSparesState),
      clock: utils.getAttr($crazy$, [opBuddyId, "clock"], initClockState),
      opId: buddyId,
      buddyId: opId,
      opBuddyId: myId,
    },
    [opId]: {
      spares: utils.getAttr($crazy$, [opId, "spares"], initSparesState),
      clock: utils.getAttr($crazy$, [opId, "clock"], initClockState),
      opId: myId,
      buddyId: opBuddyId,
      opBuddyId: buddyId,
    },
    [myId]: {
      spares: utils.getAttr($crazy$, [myId, "spares"], initSparesState),
      clock: utils.getAttr($crazy$, [myId, "clock"], initClockState),
      opId: opId,
      buddyId: buddyId,
      opBuddyId: opBuddyId,
    },
  };

  onMount(() => {
    if (wizard.isIn($wizard$, wizard.steps.PRE_GAME, "todo")) preGame();
    initChessground();
  });

  function preGame() {
    $wizard$ = wizard.next($wizard$);

    $crazy$[buddyId]["spares"] = initSparesState();
    $crazy$[buddyId]["clock"] = initClockState();
    $crazy$[opBuddyId]["spares"] = initSparesState();
    $crazy$[opBuddyId]["clock"] = initClockState();
    $crazy$[opId]["spares"] = initSparesState();
    $crazy$[opId]["clock"] = initClockState();
    $crazy$[myId]["spares"] = initSparesState();
    $crazy$[myId]["clock"] = initClockState();

    const initCgState = () => ({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      lastMove: [],
    });

    $acg$ = initCgState();
    $bcg$ = initCgState();

    clearInterval(global.state["gameTimer"]);
    global.state["gameTimer"] = setInterval(() => {
      [myId, buddyId, opId, opBuddyId].forEach((pid) => {
        if ($crazy$[pid]["clock"]["state"] != "active") return;
        let secs = $crazy$[pid]["clock"]["seconds"];
        let mins = $crazy$[pid]["clock"]["minutes"];
        if (secs == 0) {
          mins -= 1;
          secs = 59;
        } else {
          secs -= 1;
        }
        if (mins < 0) {
          $crazy$[pid]["clock"]["state"] = "timeout";
          if (pid == myId) {
            endGame("ran out of time");
          }
        } else {
          $crazy$[pid]["clock"]["seconds"] = secs;
          $crazy$[pid]["clock"]["minutes"] = mins;
        }
        $crazy$ = $crazy$;
      });
    }, 1000);

    $wizard$ = wizard.next($wizard$);
  }

  function endGame(event: "got checkmated" | "ran out of time") {
    $wizard$ = wizard.todo(wizard.steps.END_GAME);

    clearInterval(global.state["gameTimer"]);
    bChessground.set({
      viewOnly: true,
    });

    msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "endGame", {
      fromId: myId,
      spares: $crazy$[myId]["spares"],
      clock: $crazy$[myId]["clock"],
      event: event,
    });

    EventBus.publish("roomChatMsg", {
      from: "endgame",
      spot: {
        name: `${$spots$[$playerId$]["name"]} (you)`,
        avatar: $spots$[$playerId$]["avatar"],
        team: $spots$[$playerId$]["team"],
      },
      gamen: $gamen$,
      event: event,
    });

    $wizard$ = wizard.next($wizard$);
  }

  function loadState(
    cg: Api,
    chess: chtypes.ChessInstance,
    state: any,
    abcg: string,
    interactive: cgtypes.Color | false
  ) {
    chess.load(state["fen"]);
    const turnColor = chess.turn() === "w" ? "white" : "black";
    cg.set({
      fen: chess.fen(),
      lastMove: state["lastMove"],
      check: chess.in_check(),
      turnColor: turnColor,
      movable: {
        dests: chessx.moves(chess),
      },
    });

    if (abcg != "b") return;
    if (interactive != turnColor) return;

    if (!chessx.inCrazyCheckmate(chess, $crazy$[seating[abcg][interactive]]["spares"])) return;
    // checkmated
    endGame("got checkmated");
  }

  $: if (aChessground) {
    loadState(aChessground, aChess, $acg$, "a", aInteractive);
  }

  $: if (bChessground) {
    loadState(bChessground, bChess, $bcg$, "b", bInteractive);
  }

  $: if (wizard.isIn($wizard$, wizard.steps.END_GAME, "todo")) {
    $wizard$ = wizard.todo(wizard.steps.END_GAME);

    clearInterval(global.state["gameTimer"]);
    bChessground.set({
      viewOnly: true,
    });

    $wizard$ = wizard.next($wizard$);
  }

  function initChessground() {
    bChessground.set({
      movable: {
        events: {
          after: (orig: cgtypes.Key, dest: cgtypes.Key, metadata: cgtypes.MoveMetadata) => {
            const newFEN = chessx.move(bChess, orig, dest);
            if (!newFEN) {
              loadState(bChessground, bChess, $bcg$, "b", false);
              return;
            }

            $bcg$["fen"] = newFEN;
            $bcg$["lastMove"] = [orig as chtypes.Square, dest as chtypes.Square];
            $bcg$ = $bcg$;

            if (metadata.captured) $crazy$[buddyId]["spares"][metadata.captured.role] += 1;
            $crazy$[myId]["spares"]["dropType"] = undefined;
            $crazy$[myId]["spares"]["dropRole"] = undefined;
            $crazy$[opId]["spares"]["dropType"] = undefined;
            $crazy$[opId]["spares"]["dropRole"] = undefined;

            $crazy$[myId]["clock"]["state"] = "stopped";
            $crazy$[opId]["clock"]["state"] = "active";

            $crazy$ = $crazy$;

            msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "afterMove", {
              fromId: myId,
              fen: newFEN,
              lastMove: [orig, dest],
              spare: metadata.captured ? metadata.captured.role : undefined,
              clock: $crazy$[myId]["clock"],
            });
          },
          afterNewPiece: (role: cgtypes.Role, dest: cgtypes.Key, metadata: cgtypes.MoveMetadata) => {
            const color = bChess.turn() == "w" ? "white" : "black";
            const newFEN = chessx.put(bChess, { role: role, color: color }, dest);
            if (!newFEN) {
              loadState(bChessground, bChess, $bcg$, "b", false);
              return;
            }

            $bcg$["fen"] = newFEN;
            $bcg$["lastMove"] = [dest as chtypes.Square];
            $bcg$ = $bcg$;

            $crazy$[myId]["spares"][role] -= 1;
            $crazy$[myId]["spares"]["dropType"] = "drop";
            $crazy$[myId]["spares"]["dropRole"] = role;
            $crazy$[opId]["spares"]["dropType"] = undefined;
            $crazy$[opId]["spares"]["dropRole"] = undefined;

            $crazy$[myId]["clock"]["state"] = "stopped";
            $crazy$[opId]["clock"]["state"] = "active";

            $crazy$ = $crazy$;

            msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "afterNewPieceMove", {
              fromId: myId,
              fen: newFEN,
              lastMove: [dest],
              spare: role,
              clock: $crazy$[myId]["clock"],
            });
          },
        },
      },
    });
  }

  function waitForGame() {
    $wizard$ = wizard.next($wizard$);

    $spots$[$playerId$]["wizard"] = $wizard$;
    $spots$[$playerId$]["gamen"] = $gamen$;
    $spots$ = $spots$;

    if ($playerId$ == "host") {
      msgbus.sendAll(global.players, $roomId$, $playerId$, Object.keys($spots$), "updateSpots", $spots$);
      EventBus.publish("updatedSpots");
    } else {
      msgbus.send(global.players, $roomId$, $playerId$, "host", "updateSpot", { [$playerId$]: $spots$[$playerId$] });
    }
  }

  $: if (wizard.isIn($wizard$, wizard.steps.GAME_TIME, "todo")) gameTime();
  function gameTime() {
    $wizard$ = wizard.next($wizard$);
    visibleSplash = false;
  }
</script>

{#if visibleSplash}
  <Splash
    {myColor}
    {opColor}
    {myId}
    {opId}
    {buddyColor}
    {buddyId}
    {opBuddyColor}
    {opBuddyId}
    on:waitForGame="{waitForGame}"
  />
{/if}
<div class="w-full h-full overflow-hidden flex items-center justify-between">
  <div class="inline-block my-0 mx-auto">
    <BuddyChessground
      bind:buddyChessground
      bind:aChessground
      {aChessgroundConfig}
      {aInteractive}
      aWhiteName="{utils.getAttr($spots$, [seating['a']['white'], 'name'])}"
      aWhiteAvatar="{utils.getAttr($spots$, [seating['a']['white'], 'avatar'])}"
      aWhiteTeam="{utils.getAttr($spots$, [seating['a']['white'], 'team'])}"
      aWhiteClock="{utils.getAttr($crazy$, [seating['a']['white'], 'clock'])}"
      aWhiteSpares="{utils.getAttr($crazy$, [seating['a']['white'], 'spares'])}"
      aBlackName="{utils.getAttr($spots$, [seating['a']['black'], 'name'])}"
      aBlackAvatar="{utils.getAttr($spots$, [seating['a']['black'], 'avatar'])}"
      aBlackTeam="{utils.getAttr($spots$, [seating['a']['black'], 'team'])}"
      aBlackClock="{utils.getAttr($crazy$, [seating['a']['black'], 'clock'])}"
      aBlackSpares="{utils.getAttr($crazy$, [seating['a']['black'], 'spares'])}"
      bind:bChessground
      {bChessgroundConfig}
      {bInteractive}
      bWhiteName="{utils.getAttr($spots$, [seating['b']['white'], 'name'])}"
      bWhiteAvatar="{utils.getAttr($spots$, [seating['b']['white'], 'avatar'])}"
      bWhiteTeam="{utils.getAttr($spots$, [seating['b']['white'], 'team'])}"
      bWhiteClock="{utils.getAttr($crazy$, [seating['b']['white'], 'clock'])}"
      bWhiteSpares="{utils.getAttr($crazy$, [seating['b']['white'], 'spares'])}"
      bBlackName="{utils.getAttr($spots$, [seating['b']['black'], 'name'])}"
      bBlackAvatar="{utils.getAttr($spots$, [seating['b']['black'], 'avatar'])}"
      bBlackTeam="{utils.getAttr($spots$, [seating['b']['black'], 'team'])}"
      bBlackClock="{utils.getAttr($crazy$, [seating['b']['black'], 'clock'])}"
      bBlackSpares="{utils.getAttr($crazy$, [seating['b']['black'], 'spares'])}"
    />
  </div>
</div>
