const CACHE_VERSION = 3;
const STATIC_CACHE = `aaro-static-v${CACHE_VERSION}`;
const API_CACHE = `aaro-api-v${CACHE_VERSION}`;

// Precache on install
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/offline.html",
];

// API routes eligible for stale-while-revalidate
const CACHEABLE_API = [
  "/api/products",
  "/api/categories",
  "/api/brands",
  "/api/banners",
  "/api/offers",
  "/api/contact-settings",
];

// Static asset extensions — cache-first
const STATIC_EXT = /\.(js|css|woff2?|ttf|eot|png|jpe?g|gif|webp|avif|svg|ico)$/i;

// Install — precache critical assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
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

  // Static assets: cache-first
  if (STATIC_EXT.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // API requests: network-first with cache fallback
  if (CACHEABLE_API.some((path) => url.pathname === path)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(API_CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Skip non-cacheable API calls (auth, orders, etc.)
  if (url.pathname.startsWith("/api/")) return;

  // HTML navigation: network-first, offline fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  // Other: network first, cache fallback
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
