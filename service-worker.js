const CACHE = 'ethereal-drum-trainer-v38-final';
const SHELL = [
  './app-files/ethereal-achievements.css?v=36',
  './app-files/ethereal-badges.js',
  './app-files/ethereal-feedback.js',
  './app-files/badges/beginner.webp',
  './app-files/badges/comeback.webp',
  './app-files/badges/composer.webp',
  './app-files/badges/constellation.webp',
  './app-files/badges/encore.webp',
  './app-files/badges/explorer.webp',
  './app-files/badges/first.webp',
  './app-files/badges/five.webp',
  './app-files/badges/flawless.webp',
  './app-files/badges/flow.webp',
  './app-files/badges/fullspeed.webp',
  './app-files/badges/mic.webp',
  './app-files/badges/night.webp',
  './app-files/badges/patient.webp',
  './app-files/badges/perfect100.webp',
  './app-files/badges/slow.webp',
  './app-files/badges/star1.webp',
  './app-files/badges/star2.webp',
  './app-files/badges/star3.webp',
  './app-files/badges/star4.webp',
  './app-files/badges/take.webp',
  './app-files/badges/trial0.webp',
  './app-files/badges/trial1.webp',
  './app-files/badges/trial2.webp',
  './app-files/badges/week.webp',
  './app-files/badges/weekend.webp',

  './app-files/ethereal-country.js',
  './app-files/ethereal-device.js',
  './app-files/cosmetics/starlight-opal.svg',
  './app-files/ethereal-translations.js',
  './app-files/ethereal-i18n.js',
  './app-files/ethereal-i18n.css?v=38',
  './app-files/ethereal-lessons.js',
  './app-files/ethereal-cosmetics.js',
  './app-files/ethereal-cosmetics.css?v=38',
  './app-files/cosmetics/eclipse.svg',
  './app-files/cosmetics/hammered.svg',
  './app-files/cosmetics/marble-mint.webp',
  './app-files/cosmetics/marble-ocean.webp',
  './app-files/cosmetics/nebula-aqua.webp',
  './app-files/cosmetics/nebula-blue.webp',
  './app-files/cosmetics/nebula-violet.webp',
  './app-files/cosmetics/prism.svg',
  './app-files/cosmetics/vortex.svg',

  './',
  './index.html',
  './app-files/ethereal-common.css?v=36',
  './app-files/styles.css',
  './app-files/ethereal-common-layout.css',
  './app-files/ethereal-common.js',
  './app-files/app.js',
  './app-files/tutorials/a-softer-tone.mp4',
  './app-files/tongue-repertoire.js',
  './app-files/ethereal-cloud-config.js',
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
    await Promise.all(keys.filter(key => key.startsWith('ethereal-drum-trainer-') && key !== CACHE).map(key => caches.delete(key)));
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
