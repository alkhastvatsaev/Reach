const CACHE_NAME = "tajwid-vatsaev-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Outfit:wght@300;600&display=swap",
  "https://unpkg.com/peerjs@1.5.0/dist/peerjs.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch new
      return (
        response ||
        fetch(event.request).catch(() => {
          // If offline and request is for a page, return index.html
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        })
      );
    }),
  );
});
