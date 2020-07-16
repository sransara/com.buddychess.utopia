<script lang="typescript">
  import { onMount } from "svelte";

  import CrazyChessground from "../../components/CrazyChessground/index.svelte";

  import { Api } from "chessground/api";
  import { Config } from "chessground/config";
  import { Color } from "chessground/types";

  import { Chess } from "chess.js";

  function toDests(chess: any): any {
    const dests = new Map();
    chess.SQUARES.forEach((s: any) => {
      const ms = chess.moves({ square: s, verbose: true });
      if (ms.length) {
        dests.set(
          s,
          ms.map((m: any) => m.to)
        );
      }
    });
    return dests;
  }

  function chessForceChangeTurn(chess: any) {
    // trick chess.js to change turn
    // rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
    let fenParts = chess.fen().split(" ");
    fenParts[1] = fenParts[1] === "w" ? "b" : "w";
    fenParts[3] = "-";
    fenParts[4] = "0";
    fenParts[5] = chess.turn() === "b" ? parseInt(fenParts[5]) + 1 + "" : fenParts[5];
    chess.load(fenParts.join(" "));
  }

  function loadChessgroundStateFromChess(cg: Api, chess: any) {
    cg.set({
      fen: chess.fen(),
      check: chess.in_check(),
      turnColor: chess.turn() === "w" ? "white" : "black",
      movable: {
        color: chess.turn() === "w" ? "white" : "black",
        dests: toDests(chess),
      },
    });
  }

  function isValidPieceDrop(role: any, dest: any, chess: any) {
    if (role === "pawn" && (dest[1] === "1" || dest[1] === "8")) {
      return false;
    }
    return true;
  }

  // @ts-ignore
  export let myChessground: Api = undefined;
  // @ts-ignore
  export let buddyChessground: Api = undefined;

  const myChess = new Chess();
  const myChessgroundConfig: Config = {
    orientation: "black",
    movable: {
      color: "white",
      free: false,
      dests: toDests(myChess),
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

  onMount(() => {
    myChessground.set({
      movable: {
        events: {
          after: (orig: any, dest: any) => {
            myChess.move({ from: orig, to: dest, promotion: "q" });
            loadChessgroundStateFromChess(myChessground, myChess);
          },
          afterNewPiece: (role: any, dest: any) => {
            if (!isValidPieceDrop(role, dest, myChess)) {
              loadChessgroundStateFromChess(myChessground, myChess);
              return;
            }
            myChess.put({ type: role[0], color: myChess.turn() }, dest);
            chessForceChangeTurn(myChess);
            loadChessgroundStateFromChess(myChessground, myChess);
          },
        },
      },
    });
  });

  const buddyChessgroundConfig: Config = {
    orientation: "white",
  };

  let gamediv: any;

  function fitGameView() {
    if (!gamediv) return;
    let y = window.innerHeight - gamediv.offsetTop - 5;
    const rect = gamediv.getBoundingClientRect();
    let w = rect.right - rect.left;
    let h = rect.bottom - rect.top;
    let x = (y * w) / h;
    gamediv.style.width = `${Math.min(x, window.innerWidth)}px`;
  }

  let clientWidth: number;
  $: clientWidth && fitGameView(); // Chrome updates div render height multiple times
  window.addEventListener("resize", fitGameView);
</script>

<div class="select-none px-2 flex" bind:this="{gamediv}" bind:clientWidth>
  <div class="w-1/2 pr-2 inline-block">
    <CrazyChessground
      isMyChessground="{true}"
      bind:chessground="{myChessground}"
      chessgroundConfig="{myChessgroundConfig}"
      topColor="{myChessgroundConfig.orientation == 'white' ? 'black' : 'white'}"
      topSparePawnCount="{1}"
      topSpareKnightCount="{0}"
      topSpareBishopCount="{0}"
      topSpareRookCount="{1}"
      topSpareQueenCount="{0}"
      topAvatarIcon="elephant"
      topClockMinutes="{5}"
      topClockSeconds="{0}"
      bottomColor="{myChessgroundConfig.orientation == 'white' ? 'white' : 'black'}"
      bottomSparePawnCount="{1}"
      bottomSpareKnightCount="{0}"
      bottomSpareBishopCount="{0}"
      bottomSpareRookCount="{0}"
      bottomSpareQueenCount="{0}"
      bottomAvatarIcon="giraffe"
      bottomClockMinutes="{5}"
      bottomClockSeconds="{0}"
    />
  </div>
  <div class="w-1/2 pl-2 inline-block">
    <CrazyChessground
      isMyChessground="{false}"
      bind:chessground="{buddyChessground}"
      chessgroundConfig="{buddyChessgroundConfig}"
      topColor="{buddyChessgroundConfig.orientation == 'white' ? 'black' : 'white'}"
      topSparePawnCount="{0}"
      topSpareKnightCount="{0}"
      topSpareBishopCount="{0}"
      topSpareRookCount="{0}"
      topSpareQueenCount="{0}"
      topAvatarIcon="elephant"
      topClockMinutes="{5}"
      topClockSeconds="{0}"
      bottomColor="{buddyChessgroundConfig.orientation == 'white' ? 'white' : 'black'}"
      bottomSparePawnCount="{0}"
      bottomSpareKnightCount="{0}"
      bottomSpareBishopCount="{0}"
      bottomSpareRookCount="{0}"
      bottomSpareQueenCount="{0}"
      bottomAvatarIcon="giraffe"
      bottomClockMinutes="{5}"
      bottomClockSeconds="{0}"
    />
  </div>
</div>
