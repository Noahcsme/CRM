/* Cadence service worker — offline app shell + notification display.
   Data is never cached here; it lives in localStorage on the page. */
var CACHE = 'cadence-v1';
var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './store.js',
  './app.js',
  './icon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // addAll fails the whole install if any file 404s; add individually instead.
      return Promise.all(ASSETS.map(function (u) {
        return c.add(u).catch(function () { /* skip missing */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // Only handle same-origin requests (let fonts/CDN go to network).
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) {
        // refresh in background
        fetch(req).then(function (res) {
          if (res && res.ok) caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });
        }).catch(function () {});
        return cached;
      }
      return fetch(req).then(function (res) {
        if (res && res.ok && (res.type === 'basic')) {
          var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        // offline fallback to the app shell for navigations
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

// Clicking a reminder notification focuses/opens the app.
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) { if ('focus' in list[i]) return list[i].focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
