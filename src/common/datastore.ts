import { writable } from "svelte/store";

export const roomId = writable((undefined as unknown) as string);

export const _roomId = writable((undefined as unknown) as string);

export const playerId = writable((undefined as unknown) as string);

export const _playerId = writable((undefined as unknown) as string);

type wizardStep = { currStep: number; currStepStatus: "todo" | "doing" };
export const roomWizard = writable({ currStep: 1, currStepStatus: "todo" } as wizardStep);

export const spots = writable({} as any);

export const inGame = writable(false as boolean);
