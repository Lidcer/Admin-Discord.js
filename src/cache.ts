const cache = {};

export function addToCache(key: string, vaule: string) {
  if (!cache[key]) cache[key] = [];

  cache[key].push(vaule);

  setTimeout(() => {
    delete cache[key];
  }, 1000 * 60 * 10);
}

export function getIds(key): string[] {
  if (!cache[key]) return;

  return cache[key];
}
