const CACHE = 'my-recipes-v3';
const BASE  = '/my-recipes';
const SHELL = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/style.css',
  BASE + '/data.js',
  BASE + '/db.js',
  BASE + '/app.js',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.svg',
  BASE + '/icons/icon-512.svg',
  BASE + '/monoglyceride/Monoglyceride.ttf',
  BASE + '/monoglyceride/MonoglycerideBold.ttf',
  BASE + '/monoglyceride/MonoglycerideDemiBold.ttf',
  BASE + '/monoglyceride/MonoglycerideExtraBold.ttf',
  BASE + '/josefin-sans/JosefinSans-Regular.ttf',
  BASE + '/josefin-sans/JosefinSans-SemiBold.ttf',
  BASE + '/josefin-sans/JosefinSans-Bold.ttf',
  BASE + '/josefin-sans/JosefinSans-Light.ttf',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(BASE + '/index.html'));
    })
  );
});
