export function convertRemToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAttr(obj: any, path: string[]) {
  try {
    return path.reduce((acc, cur) => acc[cur], obj);
  } catch {
    return "";
  }
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
