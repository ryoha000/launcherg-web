import { writable } from "svelte/store";

const initial = { value: "", lastModified: "local" } as const;

export type Base64ImageRecord = { [path in string]: string };

const createMemo = () => {
  const store = writable<{ value: string; lastModified: "remote" | "local" }>(
    initial
  );
  const _base64ImageStore = {} as Base64ImageRecord;
  const base64ImageStore = writable<Base64ImageRecord>({});
  base64ImageStore.subscribe((value) => {
    Object.assign(_base64ImageStore, value);
  });
  const getBase64Image = (path: string) => _base64ImageStore[path];
  const appendBase64Image = (path: string, base64: string) => {
    base64ImageStore.update((prev) => ({ ...prev, [path]: base64 }));
  };
  const reset = () => store.set(initial);
  return {
    ...store,
    reset,
    appendBase64Image,
    getBase64Image,
  };
};
export const memo = createMemo();
