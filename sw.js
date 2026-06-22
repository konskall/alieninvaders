// Minimal service worker — its ONLY job is to make Alien Invaders installable as a
// PWA (Chromium requires a registered SW with a fetch handler before it will offer
// "Install" / fire `beforeinstallprompt`).
//
// It deliberately does NOT cache the game's code or assets. Every request goes
// straight to the network, so players can never get stuck on a stale version after
// a deploy — the #1 risk with PWA caching. (Trade-off: no offline play, which is
// fine — the leaderboard and online co-op need the network anyway.)
//
// skipWaiting + clients.claim mean a new sw.js takes over immediately, so even this
// file never lingers as a stale worker.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  // Network-only passthrough for navigations (enough to satisfy installability).
  // Everything else falls through to the browser's normal handling — we cache nothing.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
  }
});
