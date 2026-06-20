// Praxis PWA Service Worker
const CACHE_NAME = 'praxis-v1';
const OFFLINE_URL = '/offline.html';

// Statische Assets cachen
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/app.css',
  '/js/helpers.js',
  '/_content/MudBlazor/MudBlazor.min.css',
  '/_content/MudBlazor/MudBlazor.min.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
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
  // Nur GET-Anfragen behandeln
  if (event.request.method !== 'GET') return;

  // Blazor SignalR / WebSocket nicht abfangen
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/_blazor') || url.pathname.startsWith('/_framework')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Erfolgreiche Antwort in Cache speichern
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Offline: aus Cache laden oder Offline-Seite zeigen
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
        return new Response('', { status: 503 });
      })
  );
});
