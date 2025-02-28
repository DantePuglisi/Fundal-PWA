const CACHE_NAME = 'coupling-selector-v3';

// Get the base path for cache URLs
const getScope = () => {
  // When running in the service worker, self.location contains our URL info
  return self.location.pathname.replace(/\/[^\/]*$/, '');
};

// Create URLs with the correct base path
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './src/main.js',
  './src/styles/main.css',
  './src/screens/appSelectionScreen.js',
  './src/screens/parameterScreen.js',
  './src/screens/resultsScreen.js',
  './src/utils/couplingCalculator.js',
  './data/couplings.json',
  './data/service_factors.json',
  './assets/fundal-logo-small.png',
  './assets/fundal-logo.png'
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

// Fetch resources: try cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request - fetch() consumes the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response - cache.put() consumes the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache responses with query strings or non-GET methods
                if (event.request.url.indexOf('?') === -1 && event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(error => {
            // Special handling for document (HTML) requests - show offline page when offline
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            console.error('Fetch failed:', error);
            throw error;
          });
      })
  );
});