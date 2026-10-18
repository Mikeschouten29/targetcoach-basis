// TargetCoach Basis – werkt ook zonder internet. Eerst het netwerk proberen, anders de bewaarde versie.
const CACHE = "tcbasis-v1";
const BESTANDEN = ["./", "index.html", "planregels.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BESTANDEN)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(fetch(req).then((res) => {
    if (res.ok && new URL(req.url).origin === location.origin) { const kopie = res.clone(); caches.open(CACHE).then((c) => c.put(req, kopie)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
});
