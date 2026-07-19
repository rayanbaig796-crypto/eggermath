const CACHE_NAME = 'eggermath-v3';
const STATIC_ASSETS = [
  '/home.css',
  '/game-page.css',
  '/games.js',
  '/images/eggermath-logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never touch API, proxy, or play routes
  if (url.pathname.startsWith('/api/') ||
      url.pathname === '/proxy' ||
      url.pathname.startsWith('/play/') ||
      url.pathname === '/clear-cache') {
    return;
  }

  // Don't touch cross-origin
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first with fast timeout + cache fallback
  if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      Promise.race([
        fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: stale-while-revalidate (fast + fresh)
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
