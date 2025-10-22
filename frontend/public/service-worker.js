self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/public/thumbnails/')) {
        event.respondWith(
            caches.open('thumbnails-cache').then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) return cachedResponse;

                const serverResponse = await fetch(event.request);
                cache.put(event.request, serverResponse.clone());
                return serverResponse;
            })
        );
    }
});
