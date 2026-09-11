// Service worker, ISW-versie.
//
// Verschil met het origineel:
//  1. Network-first in plaats van cache-first. De browser haalt altijd eerst de
//     verse versie op en valt alleen op de cache terug als er geen net is.
//     Daarmee kan er nooit meer een mengeling van oude en nieuwe bestanden
//     ontstaan, wat in het origineel de reden was dat de app opeens stuk kon gaan.
//  2. Bij activatie worden alle oudere caches verwijderd. Het origineel liet die
//     staan.
//  3. De bestanden worden stuk voor stuk gecachet in plaats van met addAll, zodat
//     één geblokkeerd bestand (bijvoorbeeld cdnjs op een schoolnetwerk) niet de
//     hele installatie laat mislukken.
//
// Wil je helemaal geen offline gebruik, haal dan in index.html de regel met
// scripts/registerSW.js weg. Dan is er geen service worker en dus ook geen cache.

var CACHE_NAME = 'motionticker-isw-v1';

var urlsToCache = [
  './',
  'index.html',
  'style.css',
  'favicon.ico',
  'site.webmanifest',
  'sw.js',
  'scripts/MediaInfo.js',
  'scripts/MediaInfoWasm.wasm',
  'scripts/motionticker.js',
  'scripts/MediaInfo.js.mem',
  'scripts/fabric-patch-arrow.js',
  'scripts/registerSW.js',
  'scripts/MediaInfoWasm.js',
  'scripts/fabric-patch-touch.js',
  'scripts/opencv.js',
  'scripts/jquery.min.js',
  'scripts/Chart.min.js',
  'scripts/papaparse.min.js',
  'scripts/fabric.min.js',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'css/font-awesome.min.css',
  'fonts/fontawesome-webfont.woff',
  'fonts/fontawesome-webfont.ttf',
  'mstile-70x70.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
        urlsToCache.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.log('Niet gecachet (geen probleem): ' + url);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  // Range requests (video) niet onderscheppen.
  if (event.request.headers.has('range')) {
    return;
  }
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request).then(function(response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, copy).catch(function() {});
      }).catch(function() {});
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
