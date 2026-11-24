/* BCP minimal offline worker. It deliberately never caches authenticated or API data. */
const CACHE_VERSION = "bcp-public-shell-v1";
const OFFLINE_URL = "/offline";
const PRIVATE_PREFIXES = [
  "/admin",
  "/api",
  "/account",
  "/dashboard",
  "/documents",
  "/billing",
  "/learn",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("bcp-public-shell-") && key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    PRIVATE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return cached || Response.error();
    }),
  );
});
