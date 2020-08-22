import * as cgtypes from "chessground/types";
import { Chess } from "chess.js";
import * as chtypes from "chess.js";
import { Api } from "chessground/api";

export function fenNextTurn(fen: cgtypes.FEN): cgtypes.FEN {
  // rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
  let fenParts = fen.split(" ");
  const currentTurn = fenParts[1];
  fenParts[1] = currentTurn === "w" ? "b" : "w"; // change turn
  fenParts[3] = "-"; // enpassant
  fenParts[5] = currentTurn === "b" ? parseInt(fenParts[5]) + 1 + "" : fenParts[5];
  return fenParts.join(" ");
}

export function moves(chess: chtypes.ChessInstance): cgtypes.Dests {
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

export function move(chess: chtypes.ChessInstance, src: cgtypes.Key, dest: cgtypes.Key): cgtypes.FEN {
  chess.move({ from: src as chtypes.Square, to: dest as chtypes.Square, promotion: "q" });
  return chess.fen();
}

export function put(chess: chtypes.ChessInstance, piece: cgtypes.Piece, dest: cgtypes.Key): cgtypes.FEN {
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

export function puts(chess: chtypes.ChessInstance, piece: cgtypes.Piece) {
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

export function loadChessgroundStateFromChess(cg: Api, chess: any) {
  cg.set({
    fen: chess.fen(),
    check: chess.in_check(),
    turnColor: chess.turn() === "w" ? "white" : "black",
    movable: {
      dests: moves(chess),
    },
  });
}
