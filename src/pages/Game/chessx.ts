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

export function fenMoveNumber(fen: cgtypes.FEN): number {
  let fenParts = fen.split(" ");
  const turn = fenParts[1] === "w" ? 0 : 1;
  const fullmove = parseInt(fenParts[5]);

  return 2 * fullmove + turn - 1;
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

export function move(chess: chtypes.ChessInstance, src: cgtypes.Key, dest: cgtypes.Key): cgtypes.FEN | undefined {
  const chmove = chess.move({ from: src as chtypes.Square, to: dest as chtypes.Square, promotion: "q" });
  if (!chmove) return undefined;
  return chess.fen();
}

export function put(chess: chtypes.ChessInstance, piece: cgtypes.Piece, dest: cgtypes.Key): cgtypes.FEN | undefined {
  if (!puts(chess, [piece], [dest as chtypes.Square])) return undefined;
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

export function puts(chess: chtypes.ChessInstance, pieces: cgtypes.Piece[], squares?: chtypes.Square[]) {
  if (!squares) squares = chess.SQUARES as chtypes.Square[];

  // square is valid only if already unoccupied
  squares = squares.filter((square) => chess.get(square) == null);

  const inCheck = chess.in_check();

  // if in check, put is valid only if it removes the check
  const fen = chess.fen();
  const temp = new Chess();
  const apiece = pieces.find((piece) => {
    const asquare = (squares as chtypes.Square[]).find((dest) => {
      if (piece.role == "pawn" && ["1", "8"].includes(dest.charAt(1))) return false;
      if (!inCheck) return true;
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

    if (asquare) return true;
    else return false;
  });

  if (apiece) return true;
  else return undefined;
}
