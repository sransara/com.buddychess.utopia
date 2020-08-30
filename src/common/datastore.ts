import { writable } from "svelte/store";

export const _roomId$ = writable((undefined as unknown) as string);
export const roomId$ = writable((undefined as unknown) as string);

export const _playerId$ = writable((undefined as unknown) as string);
export const playerId$ = writable((undefined as unknown) as string);

export const spots$ = writable({} as any);

export const gamen$ = writable(0 as number);

import * as wizard from "./wizard";
export const wizard$ = writable({ stepn: 1, status: "todo" } as wizard.types.wizard);

export const crazy$ = writable({} as any);

import * as chtypes from "chess.js";
export const acg$ = writable({
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  lastMove: [] as chtypes.Square[],
});

export const bcg$ = writable({
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  lastMove: [] as chtypes.Square[],
});
