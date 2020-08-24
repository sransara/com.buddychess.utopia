import { writable } from "svelte/store";
import * as cgtypes from "chessground/types";

type dropType = "predrop" | "drop" | undefined;
type dropPiece = cgtypes.Role | undefined;

const initClockState = {
  state: false,
  minutes: 5,
  seconds: 0,
};

const initSpareState = {
  dropType: undefined,
  dropPiece: undefined,
  pawn: 0,
  knight: 0,
  bishop: 0,
  rook: 0,
  queen: 0,
};

export const aWhiteClock$ = writable({ ...initClockState });

export const aWhiteSpares$ = writable({ ...initSpareState });

export const aBlackClock$ = writable({ ...initClockState });

export const aBlackSpares$ = writable({ ...initSpareState });

export const bWhiteClock$ = writable({ ...initClockState });

export const bWhiteSpares$ = writable({ ...initSpareState });

export const bBlackClock$ = writable({ ...initClockState });

export const bBlackSpares$ = writable({ ...initSpareState });
