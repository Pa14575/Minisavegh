// MINISAVE CUSTOMER SERVICE WORKER
// Save Small. Grow Big.

const CACHE_NAME = "minisave-customer-v4";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json", "/icon.svg", "/icon-192.png", "/icon.png"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
  );

  self.skipWaiting();
});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

    }).then(() => self.clients.claim())

  );

});


self.addEventListener("fetch", event => {

  const request = event.request;
  const url = new URL(request.url);

  if(request.method !== "GET") return;

  if(url.origin !== self.location.origin) return;

  // Never cache Supabase authentication or database requests.
  if(
    url.pathname.includes("/auth/") ||
    url.pathname.includes("/rest/") ||
    url.pathname.includes("/functions/")
  ) {
    return;
  }

  event.respondWith(

    fetch(request)
      .then(response => {

        if(response && response.ok) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request,copy));

        }

        return response;

      })

      .catch(async () => {

        const cached = await caches.match(request);

        return cached ||
          (request.mode === "navigate"
            ? caches.match("/index.html")
            : Response.error());

      })

  );

});

// Push notifications intentionally excluded.