const CACHE_NAME = 'eggermath-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/game.html',
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

  // Don't cache API calls, proxy, or play routes
  if (url.pathname.startsWith('/api/') ||
      url.pathname === '/proxy' ||
      url.pathname.startsWith('/play/') ||
      url.pathname === '/clear-cache') {
    return;
  }

  // Don't cache cross-origin (CDN thumbnails, Google Fonts)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
