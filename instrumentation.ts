export async function register() {
  if (typeof globalThis.localStorage !== "undefined") {
    // Node 25+ exposes localStorage but it requires --localstorage-file.
    // Polyfill it with a simple in-memory implementation for SSR.
    const storage = new Map<string, string>();
    // @ts-ignore — overriding broken Node 25 localStorage
    globalThis.localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, String(value)),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      get length() {
        return storage.size;
      },
      key: (index: number) => [...storage.keys()][index] ?? null,
    };
  }
}
