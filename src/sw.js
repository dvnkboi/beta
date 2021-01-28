/* eslint-disable no-undef */
// import { registerRoute } from 'workbox-routing';
// import { ExpirationPlugin } from 'workbox-expiration';
// import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
// import { cacheNames } from 'workbox-core';

// importScripts('/WorkBox/workbox-routing/index.d.ts','/WorkBox/workbox-expiration/index.d.ts','/WorkBox/workbox-strategies/index.d.ts','/WorkBox/workbox-core/index.d.ts')

self.__precacheManifest = [].concat(self.__precacheManifest || []);
suppressWarnings();
precacheAndRoute(self.__precacheManifest, {});

// workbox.routing.registerRoute(
//     ({ request }) => request.destination === 'image',
//     new CacheFirst({
//         cacheName: 'images',
//         plugins: [
//             new ExpirationPlugin({
//                 maxEntries: 60,
//                 maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
//             }),
//             new CacheableResponsePlugin({statuses: [0,200]}),
//         ],
//     })
// );

// workbox.routing.registerRoute(
//     ({ request }) => request.destination === 'script' ||
//         request.destination === 'style',
//     new StaleWhileRevalidate({
//         cacheName: 'static-resources',
//     })
// );

self.addEventListener("message", (e) => {
    if (e.data.action == 'skipWaiting') self.skipWaiting()
});

// self.addEventListener('install', (event) => {
//   const urls = ['/'];
//   const cacheName = cacheNames.runtime;
//   event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urls)));
// });