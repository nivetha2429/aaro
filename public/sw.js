const CACHE_VERSION = 2;
const STATIC_CACHE = `aaro-static-v${CACHE_VERSION}`;
const API_CACHE = `aaro-api-v${CACHE_VERSION}`;
const STATIC_ASSETS = ["/", "/manifest.json"];

// API routes to cache (stale-while-revalidate)
const CACHEABLE_API = ["/api/products", "/api/categories", "/api/brands", "/api/banners", "/api/offers"];

// Install — cache shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Skip upload requests
  if (url.pathname.startsWith("/uploads/")) return;

  // API requests: stale-while-revalidate for cacheable endpoints
  if (CACHEABLE_API.some((path) => url.pathname === path)) {
    e.respondWith(
      caches.open(API_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          const fetchPromise = fetch(e.request).then((res) => {
            if (res.status === 200) cache.put(e.request, res.clone());
            return res;
          });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Skip non-cacheable API calls (auth, orders, etc.)
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: network first, fallback to cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
