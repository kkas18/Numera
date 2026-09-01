/* NUMERA — service worker
   Appen skal starte umiddelbart og virke uten nett.
   Strategi: hurtiglager først, oppdatering i bakgrunnen. */

'use strict';

const VERSION = '1.1.0';
const SHELL = 'numera-shell-v' + VERSION;
const RUNTIME = 'numera-runtime-v1';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-32.png',
  './icons/icon-64.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL)
      .then(cache => Promise.all(
        /* Én feilende fil skal ikke velte hele installasjonen. */
        PRECACHE.map(url => cache.add(new Request(url, { cache: 'reload' })).catch(() => null))
      ))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== SHELL && k !== RUNTIME).map(k => caches.delete(k))
    );
    if (self.registration.navigationPreload) {
      await self.registration.navigationPreload.enable().catch(() => {});
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* Hent fra hurtiglager, og friskt opp i bakgrunnen. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(response => {
      if (response && response.ok && response.type !== 'opaque') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* Sidevisninger: fall alltid tilbake til appskallet. */
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      const cached = await cache.match('./index.html');
      const fresh = fetch(req)
        .then(res => {
          if (res && res.ok) cache.put('./index.html', res.clone());
          return res;
        })
        .catch(() => null);
      return cached || (await fresh) || new Response(
        '<!doctype html><meta charset="utf-8"><title>Uten nett</title>' +
        '<body style="font:16px system-ui;padding:2rem">Kalkulatoren er ikke lastet ned ennå. Koble til nett én gang, så virker den offline etterpå.</body>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    })());
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(staleWhileRevalidate(req, SHELL));
    return;
  }

  /* Skrifter fra Google: lagres slik at appen ser lik ut uten nett. */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req, RUNTIME));
  }
});
