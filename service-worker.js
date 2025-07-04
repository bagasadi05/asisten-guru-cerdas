
const APP_CACHE_NAME = 'asisten-guru-static-v4';
const API_CACHE_NAME = 'asisten-guru-api-v1';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/vite.svg',
];

// Install: Caches the core app shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
  self.skipWaiting();
});

// Activate: Cleans up old, unused caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [APP_CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Defines how requests are handled.
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // API requests: Network-first, falling back to cache
  if (url.hostname === 'mgsroafwooxstthsfokd.supabase.co') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If successful, update the cache
          const responseToCache = networkResponse.clone();
          caches.open(API_CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If network fails, serve from cache
          console.log(`Network failed for ${request.url}, trying cache.`);
          return caches.match(request, { cacheName: API_CACHE_NAME });
        })
    );
    return;
  }

  // App shell requests: Cache-first, falling back to network
  event.respondWith(
    caches.match(request, { cacheName: APP_CACHE_NAME }).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then(networkResponse => {
        // Also cache new static assets if they are fetched
        if (networkResponse && networkResponse.ok) {
           const responseToCache = networkResponse.clone();
           caches.open(APP_CACHE_NAME).then(cache => {
             cache.put(request, responseToCache);
           });
        }
        return networkResponse;
      });
    })
  );
});
