const CACHE_NAME = 'cv-tailor-v3';

self.addEventListener('install', (event) => {
  // Pre-cache only the manifest (tiny, stable)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['./manifest.json']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('api.groq.com')) return;
  if (event.request.url.includes('generativelanguage.googleapis.com')) return;

  const url = new URL(event.request.url);
  // Network-first for HTML and root paths (content-hashed assets use cache-first)
  const isHtmlOrRoot =
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/') ||
    !url.pathname.split('/').pop().includes('.');

  if (isHtmlOrRoot) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((r) => r || caches.match('./index.html'))
        )
    );
  } else {
    // Cache-first for hashed assets (JS/CSS/fonts — immutable filenames)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => caches.match('./index.html'));
      })
    );
  }
});
