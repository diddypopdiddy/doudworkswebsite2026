const apiOrigin = document.querySelector('meta[name="write-with-ai-api-origin"]')?.content || location.origin;

export const studentPage = new URL("./", import.meta.url).href;

export function gameFetch(path, options) {
  return fetch(new URL(path, apiOrigin), options);
}
