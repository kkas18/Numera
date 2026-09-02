/* ================================================================
   NUMERA — service worker
   Øk VERSION hver gang du publiserer en ny utgave til GitHub.
   (Nettleseren oppdager også byte-endringer i denne filen automatisk,
   men et nytt versjonsnummer garanterer at gammel cache ryddes.)
   ================================================================ */

const VERSION = '2.2.0';
const CACHE   = 'numera-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/spacegrotesk-var-latin.woff2',
  './fonts/spacegrotesk-var-latin-ext.woff2',
  './fonts/plexmono-400-latin.woff2',
  './fonts/plexmono-400-latin-ext.woff2',
  './fonts/plexmono-500-latin.woff2',
  './fonts/plexmono-500-latin-ext.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  /* Ikke skipWaiting her: appen velger selv når den vil bytte (se index.html) */
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith('numera-') && k !== CACHE)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  /* Navigasjon (index.html): nettverk først, så cache — gir ferske filer når du er på nett */
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put('./index.html', res.clone());
        return res;
      } catch (e) {
        const cache = await caches.open(CACHE);
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  /* Øvrige filer (ikoner, manifest): cache først, oppdater i bakgrunnen */
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    const network = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await network) || Response.error();
  })());
});
