const CACHE_VERSION = 'cmc-v1-2025-09-16';
const CACHE_NAME = `precache-${CACHE_VERSION}`;
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/courses.html',
  '/admissions.html',
  '/exam-centre.html',
  '/international.html',
  '/policies.html',
  '/contact-apply.html',
  '/css/styles.css',
  '/js/main.js',
  '/assets/newlogo.png',
  '/assets/og-1200x630.png',
  '/site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('precache-') && k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigation requests, cache-first for same-origin static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          return resp;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }) || caches.match('/index.html'))
    );
    return;
  }

  if (url.origin === self.location.origin && request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((resp) => {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
          return resp;
        }).catch(() => cached);
      })
    );
  }
});

