/* eslint-disable no-undef */
// import { registerRoute } from 'workbox-routing';
// import { ExpirationPlugin } from 'workbox-expiration';
// import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
// import { cacheNames } from 'workbox-core';

importScripts('workbox-routing','workbox-expiration','workbox-strategies','workbox-core')

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new strategies.CacheFirst({
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

workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' ||
        request.destination === 'style',
    new strategies.StaleWhileRevalidate({
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