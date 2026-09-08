/* オフラインでも遊べるようにする。全アセットを先読みして cache-first で返す。 */
const CACHE = "bm-globe-v1";
const PRECACHE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./assets/countries.json",
  "./assets/earth-day.jpg", "./assets/earth-night.jpg",
  "./assets/earth-topo.jpg", "./assets/earth-water.jpg", "./assets/earth-clouds.jpg",
  "./assets/icon-192.png", "./assets/icon-512.png",
  "./assets/icon-maskable-512.png", "./assets/apple-touch-icon.png", "./assets/icon-32.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
