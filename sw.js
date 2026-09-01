/* NUMERA — service worker
   Appen skal starte umiddelbart og virke uten nett.
   Strategi: hurtiglager først, oppdatering i bakgrunnen. */

'use strict';

const VERSION = '1.2.0';
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
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(null), ms));
}

/* Si fra til alle åpne vinduer om at det finnes en nyere utgave. */
async function announce() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.postMessage({ type: 'UPDATE_READY' }));
}

function offlinePage() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><title>Uten nett</title>' +
    '<body style="font:16px system-ui;padding:2rem">Kalkulatoren er ikke lastet ned ennå. ' +
    'Koble til nett én gang, så virker den offline etterpå.</body>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

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

  /* Sidevisninger.
     Med nett: hent friskt, slik at nye filer på GitHub tas i bruk med én gang.
     Uten nett eller på treg linje: server skallet fra hurtiglageret etter 700 ms,
     og si fra til appen dersom den friske utgaven viser seg å være nyere. */
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL);
      const cached = await cache.match('./index.html');
      const tag = res => (res && (res.headers.get('etag') || res.headers.get('last-modified'))) || '';

      const fresh = fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }))
        .then(res => {
          if (res && res.ok) cache.put('./index.html', res.clone());
          return res;
        })
        .catch(() => null);

      const quick = await Promise.race([fresh, wait(700)]);
      if (quick) return quick;

      if (cached) {
        /* Vi rakk ikke å vente. Sjekk i etterkant om det kom noe nytt. */
        fresh.then(res => {
          if (res && res.ok && tag(res) && tag(res) !== tag(cached)) announce();
        });
        return cached;
      }
      return (await fresh) || offlinePage();
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
