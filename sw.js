// This project does not register a custom service worker.
// Keep the file as a no-op so there is no external script injection,
// no remote ad bootstrap, and no accidental registration.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Intentionally left empty to avoid intercepting traffic or loading remote ad scripts.
});
