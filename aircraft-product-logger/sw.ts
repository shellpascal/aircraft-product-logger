/// <reference lib="webworker" />

// sw.ts
const CACHE_NAME = 'aircraft-logger-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdn.tailwindcss.com' // Cache Tailwind CSS
];

// Declare self as ServiceWorkerGlobalScope for TypeScript to recognize service worker specific properties and methods
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to open cache or add URLs:', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }
        return fetch(event.request).then(
          networkResponse => {
            // If it's a GET request and from our origin or CDN, cache it
            if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
              // Check if the request is for an external resource like Tailwind CDN
              const isExternalResource = event.request.url.startsWith('https://cdn.tailwindcss.com');
              const isAppResource = new URL(event.request.url).origin === self.location.origin;

              if (isAppResource || isExternalResource) {
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    });
              }
            }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetch failed for:', event.request.url, error);
          // Optionally, return a custom offline page:
          // return caches.match('/offline.html'); 
          // For now, just let it fail if network is down and not in cache
          throw error;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});
