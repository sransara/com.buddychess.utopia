<script lang="typescript">
  import { onMount, onDestroy } from "svelte";
  import Splash from "./splash.svelte";
  import BuddyChessground from "../../components/BuddyChessground.svelte";
  import Sidebar from "./sidebar.svelte";

  import { Api } from "chessground/api";
  import { Config } from "chessground/config";
  import * as cgtypes from "chessground/types";

  import { Chess } from "chess.js";
  import * as chtypes from "chess.js";

  // begin:chess.js extensions
  function fenNextTurn(fen: cgtypes.FEN): cgtypes.FEN {
    // rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
    let fenParts = fen.split(" ");
    const currentTurn = fenParts[1];
    fenParts[1] = currentTurn === "w" ? "b" : "w"; // change turn
    fenParts[3] = "-"; // enpassant
    fenParts[5] = currentTurn === "b" ? parseInt(fenParts[5]) + 1 + "" : fenParts[5];
    return fenParts.join(" ");
  }

  function moves(chess: chtypes.ChessInstance): cgtypes.Dests {
    const dests = new Map<chtypes.Square, chtypes.Square[]>();
    chess.SQUARES.forEach((s: chtypes.Square) => {
      const ms = chess.moves({ square: s, verbose: true });
      if (ms.length) {
        dests.set(
          s,
          ms.map((m) => m.to)
        );
      }
    });
    // @ts-ignore
    return dests as cgtypes.Dests;
  }

  function move(chess: chtypes.ChessInstance, src: cgtypes.Key, dest: cgtypes.Key): cgtypes.FEN {
    chess.move({ from: src as chtypes.Square, to: dest as chtypes.Square, promotion: "q" });
    return chess.fen();
  }

  function put(chess: chtypes.ChessInstance, piece: cgtypes.Piece, dest: cgtypes.Key): cgtypes.FEN {
    chess.put(
      {
        type: piece.role.charAt(0) as chtypes.PieceType,
        color: piece.color.charAt(0) as "w" | "b",
      },
      dest as chtypes.Square
    );
    // trick chess.js to change turn after a piece drop
    const newFen = fenNextTurn(chess.fen());
    chess.load(newFen);
    return newFen;
  }

  function puts(chess: chtypes.ChessInstance, piece: cgtypes.Piece) {
    let squares = chess.SQUARES as chtypes.Square[];

    // square is valid only if already unoccupied
    squares = squares.filter((square) => chess.get(square) == null);

    // if pawn, can't put in 1st or 8th rank
    squares = squares.filter((dest) => piece.role == "pawn" && !["1", "8"].includes(dest.charAt(1)));

    if (!chess.in_check()) return squares;

    // if in check, put is valid only if it removes the check
    const fen = chess.fen();
    const temp = new Chess();
    squares = squares.filter((dest) => {
      temp.load(fen);
      temp.put(
        {
          type: piece.role.charAt(0) as chtypes.PieceType,
          color: piece.color.charAt(0) as "w" | "b",
        },
        dest
      );
      // valid put only if putting the piece removes the check
      return !temp.in_check();
    });

    return squares;
  }
  // end:chess.js extensions

  // just a hacky way to fit the game view to window sizes
  // - resize game view to fill window height
  // - but make sure not to overflow on the x-axis
  // - TODO: make sure a square is not too big
  let visibleSplash = true;
  // @ts-ignore
  let buddyChessground: HTMLElement = undefined;
  function fitBuddyChessground() {
    const rect = buddyChessground.getBoundingClientRect();
    const nextH = window.innerHeight - rect.top - 10;
    const currentW = rect.right - rect.left;
    const currentH = rect.bottom - rect.top;
    let nextW = (nextH * currentW) / currentH;
    const maxW = (window.innerWidth * 5) / 6;
    nextW = Math.min(nextW, maxW);
    buddyChessground.style.width = `${nextW}px`;
  }
  // @ts-ignore
  let sidebar: HTMLElement = undefined;
  function fitSidebar() {
    const rect = sidebar.getBoundingClientRect();
    const nextW = window.innerWidth - rect.left - 10;
    sidebar.style.width = `${nextW}px`;
    // sidebar.style.height = `${nextH}px`;
  }
  function fitViewport() {
    fitBuddyChessground();
    fitSidebar();
  }
  onMount(() => {
    window.addEventListener("resize", fitViewport);
    setTimeout(() => {
      fitViewport();
      visibleSplash = false;
    }, 1000);
  });
  onDestroy(() => {
    window.removeEventListener("resize", fitViewport);
  });

  const myColor: cgtypes.Color = "white";
  const myChess = new Chess();

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

  // @ts-ignore
  let aChessground: Api = undefined;
  const aChessgroundConfig: Config = {
    orientation: myColor == "white" ? "black" : "white",
    viewOnly: true,
  };
  let aInteractiveColor: cgtypes.Color | false = false;
  let aWhiteIcon = "rabbit";
  let aWhiteClock = { ...initClockState };
  let aWhiteSpares = { ...initSpareState };
  let aBlackIcon = "monkey";
  let aBlackClock = { ...initClockState };
  let aBlackSpares = { ...initSpareState };

  // @ts-ignore
  let bChessground: Api = undefined;
  const bChessgroundConfig: Config = {
    orientation: myColor,
    turnColor: "white",
    movable: {
      color: myColor,
      free: false,
      dests: moves(myChess),
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
  let bInteractiveColor: cgtypes.Color | false = "white";
  let bWhiteIcon = "elephant";
  let bWhiteClock = { ...initClockState };
  let bWhiteSpares = { ...initSpareState };
  let bBlackIcon = "giraffe";
  let bBlackClock = { ...initClockState };
  let bBlackSpares = { ...initSpareState };
</script>

{#if visibleSplash}
  <Splash
    aOrientation="{aChessgroundConfig.orientation === 'white' ? 'white' : 'black'}"
    {aInteractiveColor}
    {aWhiteIcon}
    {aBlackIcon}
    bOrientation="{bChessgroundConfig.orientation === 'white' ? 'white' : 'black'}"
    {bInteractiveColor}
    {bWhiteIcon}
    {bBlackIcon}
  />
{/if}
<div class="flex w-full">
  <BuddyChessground
    bind:buddyChessground
    bind:aChessground
    {aChessgroundConfig}
    {aInteractiveColor}
    {aWhiteIcon}
    {aWhiteClock}
    {aWhiteSpares}
    {aBlackIcon}
    {aBlackClock}
    {aBlackSpares}
    bind:bChessground
    {bChessgroundConfig}
    {bInteractiveColor}
    {bWhiteIcon}
    {bWhiteClock}
    {bWhiteSpares}
    {bBlackIcon}
    {bBlackClock}
    {bBlackSpares}
  />
  <Sidebar bind:sidebar />
</div>
