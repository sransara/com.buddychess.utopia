export function convertRemToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAttr(obj: any, path: string[], defaultInit?: any) {
  return path.reduce((acc, cur) => {
    if (acc && cur in acc) return acc[cur];
    else if (defaultInit) return defaultInit();
    else return undefined;
  }, obj);
}

export class DefaultDict {
  constructor(defaultInit: any) {
    return new Proxy(
      {},
      {
        get: (target, name) => {
          if (name in target) {
            return (target as any)[name];
          } else if (typeof defaultInit === "function") {
            (target as any)[name] = new defaultInit().valueOf();
            return (target as any)[name];
          } else {
            return defaultInit;
          }
        },
      }
    );
  }
}

export function tree(): any {
  return new Proxy(
    {},
    {
      get: (target, name) => {
        if (name in target) {
          return (target as any)[name];
        } else {
          (target as any)[name] = tree();
          return (target as any)[name];
        }
      },
    }
  );
}

export class IntervalTimer {
  fn: () => void;
  time: number;
  timer: number | undefined;

  constructor(fn: () => void, time: number) {
    this.fn = fn;
    this.time = time;
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    return this;
  }

  start() {
    if (!this.timer) {
      this.stop();
      this.timer = setInterval(this.fn, this.time);
    }
    return this;
  }

  reset(newTime = this.time) {
    this.time = newTime;
    return this.stop().start();
  }
}

export function getRandomInt(min: number, max: number) {
  //The maximum is exclusive and the minimum is inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
