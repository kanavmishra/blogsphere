self.addEventListener("install", (event) => {
  console.log("♻️ Service Worker installing - skipping wait");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("♻️ Service Worker activating - clearing caches");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Removed the fetch listener to prevent caching of dev assets and source code.

