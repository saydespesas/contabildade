const CACHE_NAME = "saydespesas-financas-v3";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request)
        .then(networkResponse => {
          const copy = networkResponse.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          });

          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
