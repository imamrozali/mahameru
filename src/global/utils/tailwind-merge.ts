import { twMerge } from "tailwind-merge";

type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined;
type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];

function toVal(mix: unknown): string {
  let k: number;
  let y: string | undefined;
  let str = "";

  if (typeof mix === "string" || typeof mix === "number") {
    str += mix;
  } else if (typeof mix === "object") {
    if (Array.isArray(mix)) {
      const len = mix.length;
      for (k = 0; k < len; k++) {
        if (mix[k]) {
          y = toVal(mix[k]);
          if (y) {
            if (str) {
              str += " "; // Explicit conditional
            }
            str += y;
          }
        }
      }
    } else if (mix && typeof mix === "object") {
      for (y in mix as ClassDictionary) {
        if ((mix as ClassDictionary)[y]) {
          if (str) {
            str += " "; // Explicit conditional
          }
          str += y;
        }
      }
    }
  }

  return str;
}

function clsx(...args: unknown[]): string {
  let i = 0;
  let tmp: unknown;
  let x: string | undefined;
  let str = "";
  const len = args.length;

  for (; i < len; i++) {
    tmp = args[i];
    if (tmp) {
      x = toVal(tmp);
      if (x) {
        if (str) {
          str += " ";
        }
        str += x;
      }
    }
  }
  return str;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
