const CACHE_NAME = 'coupling-selector-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '../src/main.js',
  '../src/styles/main.css',
  '../src/screens/appSelectionScreen.js',
  '../src/screens/parameterScreen.js',
  '../src/screens/resultsScreen.js'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch resources: try network first, fall back to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});