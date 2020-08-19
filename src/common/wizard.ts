export namespace types {
  export type status = "todo" | "doing";
  export type wizard = { stepn: number; status: status };
}

export const steps = {
  CREATE_OR_JOIN_ROOM_SPACE: 1,
  SAVE_SPOT: 2,
  WAIT_FOR_SPOTS: 3,
  PRE_GAME: 4,
  WAIT_FOR_GAME: 5,
  GAME_TIME: 6,
  END_GAME: 7,
};

function neww(wizard: types.wizard | {}, stepn: number | undefined, status: types.status | undefined): types.wizard {
  const mods: any = {};
  if (stepn) {
    mods["stepn"] = stepn;
  }
  if (status) {
    mods["status"] = status;
  }

  return { ...wizard, ...mods };
}

let doOnce: any = {};
export function next(wizard: types.wizard, fn?: () => void): types.wizard {
  let stepn = wizard["stepn"];
  let status = wizard["status"];

  let newWiz;
  if (status == "todo") {
    newWiz = neww(wizard, undefined, "doing");
  } else {
    // if (currStatus == "doing")
    newWiz = neww(wizard, stepn + 1, "todo");
  }
  if (fn) {
    let key = [newWiz["stepn"], newWiz["status"]].join("_");
    if (key in doOnce === false) fn();

    doOnce[key] = true;
  }
  return newWiz;
}

export function back(wizard: types.wizard): types.wizard {
  let stepn = wizard["stepn"];
  let status = wizard["status"];

  if (status == "todo") {
    return neww(wizard, stepn - 1, "doing");
  }
  // else if (currStatus == "doing")
  return neww(wizard, undefined, "todo");
}

export function todo(stepn: number) {
  return neww({}, stepn, "todo");
}

export function doing(stepn: number) {
  return neww({}, stepn, "doing");
}

export function isIn(wizard: types.wizard, stepn: number, status?: types.status) {
  return wizard["stepn"] == stepn && (!status || wizard["status"] == status);
}

export function isAfter(wizard: types.wizard, stepn: number, status: types.status = "doing") {
  if (wizard["stepn"] > stepn) return true;
  if (wizard["stepn"] < stepn) return false;
  // stepn-s are equal
  return wizard["status"] == "doing" && status == "todo";
}

export function isBefore(wizard: types.wizard, stepn: number, status: types.status = "todo") {
  if (wizard["stepn"] < stepn) return true;
  if (wizard["stepn"] > stepn) return false;
  // stepn-s are equal
  return wizard["status"] == "todo" && status == "doing";
}

export function equals(wizard1: types.wizard, wizard2: types.wizard) {
  return wizard1["stepn"] == wizard2["stepn"] && wizard1["status"] == wizard2["status"];
}
