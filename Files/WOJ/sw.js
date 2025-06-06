const CACHE_NAME = 'woj-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './tick.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.png',
  './styles.css',
  './styles1.css',
  './script.js',
  './script2.js',
  './button-switcher.js',
  './button-switcher.css',
  './jsons/missions.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
