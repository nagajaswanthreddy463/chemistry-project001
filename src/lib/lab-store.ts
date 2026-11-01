import { useSyncExternalStore } from "react";

// Currently selected molecule shared across lab pages.
let current = "CC(=O)Nc1ccc(O)cc1";
const subs = new Set<() => void>();

export function setSmiles(s: string) {
  current = s;
  subs.forEach((f) => f());
}

export function useSmiles() {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => current,
    () => current,
  );
}
