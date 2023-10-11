import { writable } from "svelte/store";

const initial = { value: "", lastModified: "local" } as const;

export type Base64ImageRecord = { [path in string]: string };

const createMemo = () => {
  const store = writable<{ value: string; lastModified: "remote" | "local" }>(
    initial
  );
  const reset = () => store.set(initial);
  return {
    ...store,
    reset,
  };
};

const createBase64ImageStore = () => {
  const store = writable<Base64ImageRecord>({});
  const appendBase64Image = (path: string, base64: string) => {
    store.update((prev) => ({ ...prev, [path]: base64 }));
  };
  return {
    ...store,
    appendBase64Image,
  };
};
export const memo = createMemo();
export const base64ImageStore = createBase64ImageStore();
