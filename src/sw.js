/* eslint-disable no-undef */
importScripts('workbox-routing')
importScripts('workbox-expiration')
importScripts('workbox-strategies')
importScripts('workbox-core')

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
            new CacheableResponsePlugin({statuses: [0,200]}),
        ],
    })
);

registerRoute(
    ({ request }) => request.destination === 'script' ||
        request.destination === 'style',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    })
);

self.addEventListener("message", (e) => {
    if (e.data.action == 'skipWaiting') self.skipWaiting()
});

self.addEventListener('install', (event) => {
  const urls = ['/'];
  const cacheName = cacheNames.runtime;
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urls)));
});