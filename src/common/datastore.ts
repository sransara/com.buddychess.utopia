import { writable } from "svelte/store";

export const _roomId$ = writable((undefined as unknown) as string);
export const roomId$ = writable((undefined as unknown) as string);

export const _playerId$ = writable((undefined as unknown) as string);
export const playerId$ = writable((undefined as unknown) as string);

interface Settings {
  minsPerSide: number;
  startingPosition: "standard" | "fischer";
  fischerSeed: number;
}

export const settings$ = writable({
  minsPerSide: 3,
  startingPosition: "standard", // standard | fischer
  fischerSeed: 0,
} as Settings);

import * as wizard from "./wizard";
export const wizard$ = writable({ stepn: 1, status: "todo" } as wizard.types.wizard);

export const spots$ = writable({} as any);

export const gamen$ = writable(0 as number);

export const crazy$ = writable({} as any);

import * as chtypes from "chess.js";
export const acg$ = writable({
  fen: "",
  lastMove: [] as chtypes.Square[],
});

export const bcg$ = writable({
  fen: "",
  lastMove: [] as chtypes.Square[],
});
