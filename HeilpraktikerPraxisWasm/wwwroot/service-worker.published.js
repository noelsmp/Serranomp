const cacheVersion = 'praxis-wasm-v1';
const offlineFallback = 'offline.html';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheVersion).then(cache => cache.addAll([
            './',
            'offline.html',
            'manifest.webmanifest',
        ]))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== cacheVersion).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(cacheVersion).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(async () => {
                if (event.request.headers.get('accept')?.includes('text/html'))
                    return caches.match(offlineFallback);
                return new Response('', { status: 503 });
            });
        })
    );
});
