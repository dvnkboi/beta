/* eslint-disable no-undef */
(async () => {
    self.__precacheManifest = [].concat(self.__precacheManifest || []);
    workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

    self.addEventListener("message", (e) => {
        if (e.data.action == 'skipWaiting') self.skipWaiting()
    });

    let registerRoute = await import(/* webpackChunkName: "registerRoute" */ 'workbox-routing')
    registerRoute = registerRoute.registerRoute;
    let ExpirationPlugin = await import(/* webpackChunkName: "ExpirationPlugin" */ 'workbox-expiration')
    ExpirationPlugin = ExpirationPlugin.ExpirationPlugin;
    let CacheFirst = await import(/* webpackChunkName: "CacheFirst" */ 'workbox-strategies')
    CacheFirst = CacheFirst.CacheFirst;
    let StaleWhileRevalidate = await import(/* webpackChunkName: "StaleWhileRevalidate" */ 'workbox-strategies')
    StaleWhileRevalidate = StaleWhileRevalidate.StaleWhileRevalidate;
    let cacheNames = await import(/* webpackChunkName: "cacheNames" */ 'workbox-core')
    cacheNames = cacheNames.cacheNames;

    registerRoute(
        ({ request }) => request.destination === 'image',
        new CacheFirst({
            cacheName: 'images',
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                }),
                new CacheableResponsePlugin({ statuses: [0, 200] }),
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
})();
