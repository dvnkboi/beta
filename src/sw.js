/* eslint-disable no-undef */

import { registerRoute } from 'workbox-routing';
 import { ExpirationPlugin } from 'workbox-expiration';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { cacheNames } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

self.__precacheManifest = [].concat(self.__precacheManifest || []);
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 700,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            })
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

self.addEventListener('install', (event) => {
  const urls = ['/'];
  const cacheName = cacheNames.runtime;
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urls)));
});

self.addEventListener("message", (e) => {
    if (e.data.action == 'skipWaiting') self.skipWaiting()
});