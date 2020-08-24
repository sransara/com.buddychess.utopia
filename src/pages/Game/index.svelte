<script lang="typescript">
  import BuddyChessground from "../../components/BuddyChessground.svelte";
  import Sidebar from "../../components/Sidebar.svelte";
  import Avatar from "../../components/Avatar/index.svelte";
  import Piece from "../../components/Piece.svelte";

  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
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
    const nextH = Math.floor(window.innerHeight - utils.convertRemToPixels(5));
    const currentW = rect.right - rect.left;
    const currentH = rect.bottom - rect.top;
    let nextW = (nextH * currentW) / currentH;
    const maxW = (window.innerWidth * 4) / 5 - 15;
    nextW = Math.min(nextW, maxW);
    buddyChessground.style.width = `${Math.floor(nextW)}px`;
  }

  onMount(async () => {
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", fitViewport);
    await utils.sleep(500);
    fitViewport();
    if (wizard.isAfter($wizard$, wizard.steps.WAIT_FOR_GAME)) visibleSplash = false;
  });

  onDestroy(() => {
    document.body.style.overflow = "auto";
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

  let bInteractive: cgtypes.Color | false = myColor;
  let aInteractive: cgtypes.Color | false = false;

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
    minutes: 1,
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
            EventBus.publish("gameEnded", {
              fromId: pid,
              event: "timeout",
              clock: $crazy$[pid]["clock"],
            });
            clearInterval(global.state["gameTimer"]);
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

  function loadState(cg: Api, chess: chtypes.ChessInstance, state: any) {
    chess.load(state["fen"]);
    cg.set({
      fen: chess.fen(),
      check: chess.in_check(),
      turnColor: chess.turn() === "w" ? "white" : "black",
      movable: {
        dests: chessx.moves(chess),
      },
    });
  }

  $: if (aChessground) {
    loadState(aChessground, aChess, $acg$);
  }

  $: if (bChessground) {
    loadState(bChessground, bChess, $bcg$);
  }

  $: if (bChessground && [myId, opId].find((pid) => $crazy$[pid]["clock"]["state"] == "timeout")) {
    bChessground.stop();
  }

  function initChessground() {
    bChessground.set({
      movable: {
        events: {
          after: (orig: cgtypes.Key, dest: cgtypes.Key, metadata: cgtypes.MoveMetadata) => {
            const newFEN = chessx.move(bChess, orig, dest);
            if (!newFEN) {
              loadState(bChessground, bChess, $bcg$);
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
              loadState(bChessground, bChess, $bcg$);
              return;
            }

            $bcg$["fen"] = newFEN;
            $bcg$["lastMove"] = [dest as chtypes.Square];
            $bcg$ = $bcg$;

            $crazy$[myId]["spares"]["dropType"] = "drop";
            $crazy$[myId]["spares"]["dropRole"] = role;
            $crazy$[opId]["spares"]["dropType"] = undefined;
            $crazy$[opId]["spares"]["dropRole"] = undefined;

            $crazy$[myId]["spares"][role] -= 1;
            $crazy$[myId]["clock"]["state"] = "stopped";
            $crazy$[opId]["clock"]["state"] = "waiting";

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

<style>
  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  .shaking {
    animation: shake 1s infinite;
    transform: translate3d(0, 0, 0);
  }
</style>

{#if visibleSplash}
  <div out:fade class="w-full h-full fixed flex left-0 bg-white items-center justify-center z-50">
    <div class="flex flex-col">
      <div class="flex w-64 h-16 items-center justify-center text-3xl">
        {#if wizard.isBefore(utils.getAttr($spots$, [opBuddyId, 'wizard'], wizard.reset), wizard.steps.WAIT_FOR_GAME, 'doing')}
          <span class="w-full inline-block bg-gray-200 px-2 py-1 text-center">Ready?</span>
        {:else}
          <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
        {/if}
      </div>
      <div class="flex w-64 h-16 items-center justify-center text-3xl bg-yellow-500">
        {utils.getAttr($spots$, [opBuddyId, 'name'])}
      </div>
      <div class="flex w-64 h-32">
        <span
          class="{global.teambg[utils.getAttr($spots$, [opBuddyId, 'team'])]} inline-block w-1/2 h-full border
          border-gray-400"
        >
          <Avatar avatar="{utils.getAttr($spots$, [opBuddyId, 'avatar'])}" />
        </span>
        <span class="inline-block w-1/2 h-full cg-square dark">
          <Piece role="king" color="{opBuddyColor}" />
        </span>
      </div>
      <div class="flex w-64 h-32">
        <span class="inline-block w-1/2 h-full cg-square dark"></span>
        <span class="inline-block w-1/2 h-full cg-square light"></span>
      </div>
      <div class="flex w-64 h-32">
        <span
          class="{global.teambg[utils.getAttr($spots$, [buddyId, 'team'])]} inline-block w-1/2 h-full border
          border-gray-400"
        >
          <Avatar avatar="{utils.getAttr($spots$, [buddyId, 'avatar'])}" />
        </span>
        <span class="inline-block w-1/2 h-full cg-square dark">
          <Piece role="king" color="{buddyColor}" />
        </span>
      </div>
      <div class="flex w-64 h-16 items-center justify-center text-3xl bg-yellow-500">
        {utils.getAttr($spots$, [buddyId, 'name'])}
      </div>
      <div class="flex w-64 h-6 items-center justify-center text-xl bg-yellow-500">Your buddy</div>
      <div class="flex w-64 h-16 items-center justify-center text-3xl">
        {#if wizard.isBefore(utils.getAttr($spots$, [buddyId, 'wizard'], wizard.reset), wizard.steps.WAIT_FOR_GAME, 'doing')}
          <span class="w-full inline-block bg-gray-200 px-2 py-1 text-center">Ready?</span>
        {:else}
          <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
        {/if}
      </div>
    </div>
    <div class="flex flex-col">
      <div class="flex w-32 h-32 items-center justify-center text-4xl font-serif">&amp;</div>
      <div class="flex w-32 h-32 items-center justify-center text-6xl font-serif">vs</div>
      <div class="flex w-32 h-32 items-center justify-center text-4xl font-serif">&amp;</div>
      <div class="flex w-32 h-16 items-center justify-center font-serif"></div>
    </div>
    <div class="flex flex-col shaking">
      <div class="flex w-64 h-16 items-center justify-center text-3xl">
        {#if wizard.isBefore(utils.getAttr($spots$, [opId, 'wizard'], wizard.reset), wizard.steps.WAIT_FOR_GAME, 'doing')}
          <span class="w-full inline-block bg-gray-200 px-2 py-1 text-center">Ready?</span>
        {:else}
          <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
        {/if}
      </div>
      <div class="flex w-64 h-16 items-center justify-center text-3xl bg-yellow-500">
        {utils.getAttr($spots$, [opId, 'name'])}
      </div>
      <div class="flex w-64 h-32">
        <span
          class="{global.teambg[utils.getAttr($spots$, [opId, 'team'])]} inline-block w-1/2 h-full border
          border-gray-400"
        >
          <Avatar avatar="{utils.getAttr($spots$, [opId, 'avatar'])}" />
        </span>
        <span class="inline-block w-1/2 h-full cg-square dark">
          <Piece role="king" color="{opColor}" />
        </span>
      </div>
      <div class="flex w-64 h-32">
        <span class="inline-block w-1/2 h-full cg-square dark"></span>
        <span class="inline-block w-1/2 h-full cg-square light"></span>
      </div>
      <div class="flex w-64 h-32">
        <span
          class="{global.teambg[utils.getAttr($spots$, [myId, 'team'])]} inline-block w-1/2 h-full border
          border-gray-400"
        >
          <Avatar avatar="{utils.getAttr($spots$, [myId, 'avatar'])}" />
        </span>
        <span class="inline-block w-1/2 h-full cg-square dark">
          <Piece role="king" color="{myColor}" />
        </span>
      </div>
      <div class="flex w-64 h-16 items-center justify-center text-3xl bg-yellow-500">
        {utils.getAttr($spots$, [myId, 'name'])}
      </div>
      <div class="flex w-64 h-6 items-center justify-center text-xl bg-yellow-500">You</div>
      <div class="flex w-64 h-16 items-center justify-center text-3xl">
        {#if wizard.isBefore($wizard$, wizard.steps.WAIT_FOR_GAME)}
          <button class="w-full bg-gray-500 text-black px-2 py-1 focus:outline-none rounded-lg" disabled="{true}">
            Ready?
          </button>
        {:else if wizard.isIn($wizard$, wizard.steps.WAIT_FOR_GAME, 'todo')}
          <button
            class="w-full bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 focus:outline-none rounded-lg"
            on:click="{waitForGame}"
          >
            Ready?
          </button>
        {:else}
          <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
        {/if}
      </div>
    </div>
  </div>
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
  <Sidebar>
    <div class="container mb-1 border border-gray-400">
      <div class="p-1 bg-gray-800 text-gray-200 whitespace-no-wrap">Room overview</div>
      <div></div>
    </div>
    <div class="container mb-1 border border-gray-400">
      <div class="p-1 bg-gray-800 text-gray-200 whitespace-no-wrap">Actions</div>
      <div>a</div>
    </div>
    <div class="flex-grow container border border-gray-400">
      <div class="p-1 bg-gray-800 text-gray-200 whitespace-no-wrap">Room chat</div>
      <div></div>
    </div>
  </Sidebar>
</div>
