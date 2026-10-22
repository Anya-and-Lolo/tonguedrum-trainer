const CACHE = 'ethereal-drum-trainer-v85-fit';
const SHELL = [
  './',
  './index.html',
  './app-files/styles.css',
  './app-files/app.js',
  './app-files/community-upload-config.js',
  './app-files/demo-catalog.js',
  './app-files/manifest.webmanifest',
  './app-files/kofi-logo.webp',
  './app-files/icon-192.png',
  './app-files/icon-512.png',
  './app-files/icon-maskable-512.png',
  './app-files/fonts/fredoka-latin-600-normal.woff2',
  './app-files/fonts/fredoka-latin-700-normal.woff2'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response && response.ok && request.url.startsWith(self.location.origin)) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function freshSongCatalog(request) {
  const cache = await caches.open(CACHE);
  const canonical = new Request(new URL('./app-files/demo-catalog.js', self.registration.scope).href);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) cache.put(canonical, response.clone()).catch(() => {});
    return response;
  } catch (error) {
    const cached = await cache.match(canonical);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // The public song catalogue always checks the network. A single canonical
  // fallback copy is kept for offline use; cache-busting poll URLs are not stored.
  if (url.origin === self.location.origin && url.pathname.endsWith('/app-files/demo-catalog.js')) {
    event.respondWith(freshSongCatalog(event.request));
    return;
  }

  if (event.request.mode === 'navigate' || url.origin === self.location.origin) {
    event.respondWith(networkFirst(event.request));
  }
});
