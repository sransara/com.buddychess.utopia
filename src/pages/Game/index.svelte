<script lang="typescript">
  import Splash from "./splash.svelte";
  import BuddyChessground from "../../components/BuddyChessground.svelte";
  import Sidebar from "../../components/Sidebar.svelte";
  import Avatar from "../../components/Avatar/index.svelte";
  import Piece from "../../components/Piece.svelte";

  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { replace } from "svelte-spa-router";

  import { EventBusSingleton as EventBus } from "light-event-bus";

  import { _roomId$, roomId$, _playerId$, playerId$, spots$, wizard$, gamen$ } from "../../common/datastore";
  import {
    aFEN$,
    bFEN$,
    aWhiteClock$,
    aWhiteSpares$,
    aBlackClock$,
    aBlackSpares$,
    bWhiteClock$,
    bWhiteSpares$,
    bBlackClock$,
    bBlackSpares$,
  } from "./store";
  import * as global from "../../common/dataglobal";
  import * as msgbus from "../../common/msgbus";
  import * as wizard from "../../common/wizard";
  import * as utils from "../../common/utils";
  import { allSpotsInSync } from "../Room/common";

  import * as chessx from "./chessx";
  import { Api } from "chessground/api";
  import { Config } from "chessground/config";
  import * as cgtypes from "chessground/types";
  import { Chess } from "chess.js";

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
  const buddyOpColor = myColor;
  const buddyOpId = opTeam[colors.indexOf(buddyOpColor)];

  const myChess = new Chess($bFEN$);
  const buddyChess = new Chess($aFEN$);

  let bInteractive: cgtypes.Color | false = myColor;
  let aInteractive: cgtypes.Color | false = false;

  const seating: any = {
    b: {
      [myColor]: myId,
      [opColor]: opId,
    },
    a: {
      [buddyColor]: buddyId,
      [buddyOpColor]: buddyOpId,
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
    draggable: {
      enabled: true,
      showGhost: true,
    },
    premovable: {
      enabled: true,
    },
    predroppable: {
      enabled: true,
    },
  };

  onMount(() => {
    if (wizard.isIn($wizard$, wizard.steps.PRE_GAME, "todo")) preGame();

    buddyChess.load($aFEN$);
    myChess.load($bFEN$);

    chessx.loadChessgroundStateFromChess(aChessground, buddyChess);
    chessx.loadChessgroundStateFromChess(bChessground, myChess);
  });

  function preGame() {
    $wizard$ = wizard.next($wizard$);

    const initClockState = {
      waiting: false,
      minutes: 5,
      seconds: 0,
    };

    const initSpareState = {
      dropType: undefined,
      dropPiece: undefined,
      pawnCount: 0,
      knightCount: 0,
      bishopCount: 0,
      rookCount: 0,
      queenCount: 0,
    };

    $aWhiteClock$ = { ...initClockState };
    $aWhiteSpares$ = { ...initSpareState };
    $aBlackClock$ = { ...initClockState };
    $aBlackSpares$ = { ...initSpareState };
    $bWhiteClock$ = { ...initClockState };
    $bWhiteSpares$ = { ...initSpareState };
    $bBlackClock$ = { ...initClockState };
    $bBlackSpares$ = { ...initSpareState };

    $aFEN$ = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    $bFEN$ = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    $wizard$ = wizard.next($wizard$);
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
        {#if wizard.isBefore(utils.getAttr($spots$, [buddyOpId, 'wizard']), wizard.steps.WAIT_FOR_GAME, 'doing')}
          <span class="w-full inline-block bg-gray-200 px-2 py-1 text-center">Ready?</span>
        {:else}
          <span in:fade class="w-full inline-block bg-green-200 px-2 py-1 text-center">Ready</span>
        {/if}
      </div>
      <div class="flex w-64 h-16 items-center justify-center text-3xl bg-yellow-500">
        {utils.getAttr($spots$, [buddyOpId, 'name'])}
      </div>
      <div class="flex w-64 h-32">
        <span
          class="{global.teambg[utils.getAttr($spots$, [buddyOpId, 'team'])]} inline-block w-1/2 h-full border
          border-gray-400"
        >
          <Avatar avatar="{utils.getAttr($spots$, [buddyOpId, 'avatar'])}" />
        </span>
        <span class="inline-block w-1/2 h-full cg-square dark">
          <Piece role="king" color="{buddyOpColor}" />
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
        {#if wizard.isBefore(utils.getAttr($spots$, [buddyId, 'wizard']), wizard.steps.WAIT_FOR_GAME, 'doing')}
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
        {#if wizard.isBefore(utils.getAttr($spots$, [opId, 'wizard']), wizard.steps.WAIT_FOR_GAME, 'doing')}
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
        {#if wizard.isBefore(utils.getAttr($spots$, [myId, 'wizard']), wizard.steps.WAIT_FOR_GAME, 'doing')}
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
      aWhiteClock="{$aWhiteClock$}"
      aWhiteSpares="{$aWhiteSpares$}"
      aBlackName="{utils.getAttr($spots$, [seating['a']['black'], 'name'])}"
      aBlackAvatar="{utils.getAttr($spots$, [seating['a']['black'], 'avatar'])}"
      aBlackTeam="{utils.getAttr($spots$, [seating['a']['black'], 'team'])}"
      aBlackClock="{$aBlackClock$}"
      aBlackSpares="{$aBlackSpares$}"
      bind:bChessground
      {bChessgroundConfig}
      {bInteractive}
      bWhiteName="{utils.getAttr($spots$, [seating['b']['white'], 'name'])}"
      bWhiteAvatar="{utils.getAttr($spots$, [seating['b']['white'], 'avatar'])}"
      bWhiteTeam="{utils.getAttr($spots$, [seating['b']['white'], 'team'])}"
      bWhiteClock="{$bWhiteClock$}"
      bWhiteSpares="{$bWhiteSpares$}"
      bBlackName="{utils.getAttr($spots$, [seating['b']['black'], 'name'])}"
      bBlackAvatar="{utils.getAttr($spots$, [seating['b']['black'], 'avatar'])}"
      bBlackTeam="{utils.getAttr($spots$, [seating['b']['black'], 'team'])}"
      bBlackClock="{$bBlackClock$}"
      bBlackSpares="{$bBlackSpares$}"
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
