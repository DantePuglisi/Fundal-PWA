const cacheName = 'pwa-fundal-v1';
const filesToCache = [
    '/Fundal-PWA/',
    '/Fundal-PWA/index.html',
    '/Fundal-PWA/app.js',
    '/Fundal-PWA/manifest.json',
    '/Fundal-PWA/assets/fundal-logo-small.png',
    '/Fundal-PWA/assets/fundal-logo.png'
];

// Instalar el service worker y almacenar los archivos en caché
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

// Activar el service worker y eliminar cachés antiguas si es necesario
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Interceptar solicitudes y responder desde la caché si es posible
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
