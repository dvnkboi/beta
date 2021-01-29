/* eslint-disable no-undef */

import { registerRoute } from 'workbox-routing';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { cacheNames } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BroadcastUpdatePlugin } from 'workbox-broadcast-update';

self.__precacheManifest = [].concat(self.__precacheManifest || []);
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 700,
                maxAgeSeconds: 30 * 24 * 60 * 60 * 12,
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200]
            })
        ],
    })
);

registerRoute(
    ({ request }) => request.destination === 'script' ||
        request.destination === 'style',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
        plugins: [
            new BroadcastUpdatePlugin(),
        ],
    })
);

self.addEventListener('install', (event) => {
    const urls = ['/'];
    const cacheName = cacheNames.runtime;
    event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urls)));
});

self.addEventListener("message",async (e) => {
    if (e.data.action == 'skipWaiting') self.skipWaiting();

    if (e.data.meta === 'workbox-broadcast-update') {
        const {cacheName} = e.data.payload;
        caches.delete(cacheName);

        self.skipWaiting();
    }
});