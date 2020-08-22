import { writable } from "svelte/store";
import * as cgtypes from "chessground/types";

type dropType = "predrop" | "drop" | undefined;
type dropPiece = cgtypes.Role | undefined;

export let aFEN$ = writable("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
export let bFEN$ = writable("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

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

export const aWhiteClock$ = writable({ ...initClockState });

export const aWhiteSpares$ = writable({ ...initSpareState });

export const aBlackClock$ = writable({ ...initClockState });

export const aBlackSpares$ = writable({ ...initSpareState });

export const bWhiteClock$ = writable({ ...initClockState });

export const bWhiteSpares$ = writable({ ...initSpareState });

export const bBlackClock$ = writable({ ...initClockState });

export const bBlackSpares$ = writable({ ...initSpareState });
