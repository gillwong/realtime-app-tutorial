import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classNames: ClassValue[]) {
  return twMerge(clsx(classNames));
}

export function getChatHref(id1:string, id2:string) {
  const sortedIds = [id1, id2].toSorted();
  return `${sortedIds[0]}--${sortedIds[1]}`
}

export function toPusherKey(key:string) {
  return key.replace(/:/g, "__");
}
