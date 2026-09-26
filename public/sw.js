const CACHE = "arunika-v8-demo-assets";
const CORE = [
  "/",
  "/app",
  "/pro",
  "/activate",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/demo/books/atomic-habits.jpg",
  "/demo/books/psychology-of-money.jpg",
  "/demo/books/deep-work.jpg",
  "/demo/books/essentialism.jpg",
  "/demo/books/make-time.jpg",
  "/demo/books/thinking-fast-slow.jpg",
  "/demo/learning/ali-abdaal-study.jpg",
  "/demo/learning/raditya-genz.jpg",
  "/demo/learning/huberman-focus.jpg",
  "/demo/learning/huberman-study.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/app")) || Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      }).catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
