const cacheName = 'pwa-fundal-v1';
const filesToCache = [
    '/Fundal-PWA/',
    '/Fundal-PWA/index.html',
    '/Fundal-PWA/app.js',
    '/Fundal-PWA/manifest.json',
    '/Fundal-PWA/assets/tecnodinamiafundal_logo.jpeg'
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
