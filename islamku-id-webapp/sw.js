const CACHE_NAME = "islamku-shell-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./tema-zamrud.css",
  "./theme.js",
  "./content.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("islamku-shell-") && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});
const DEFAULT_SNOOZE_MINUTES = 5;

/* Klik notifikasi: buka/fokuskan aplikasi, dan teruskan aksi tombol
   ("Ingatkan 5 menit lagi" / "Tandai sudah shalat") ke halaman aktif. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || "./";
  const action = event.action || "open";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const client = clientList.find(
          (item) => new URL(item.url).origin === self.location.origin,
        );
        if (!client) return self.clients.openWindow(targetUrl);
        return client.focus().then((focused) => {
          const active = focused || client;
          if (typeof active.postMessage === "function") {
            active.postMessage({
              type: "islamku:reminder-action",
              action,
              prayer: data.prayer || null,
              minutes: Number(data.snoozeMinutes) || DEFAULT_SNOOZE_MINUTES,
            });
          }
          if (action !== "open") return active;
          if (typeof active.navigate !== "function") return active;
          return active.navigate(targetUrl).catch(() => active);
        });
      }),
  );
});

