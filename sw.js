const cacheName = 'pwa-calculator-v1';
const filesToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/assets/tecnodinamiafundal_logo.jpeg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
