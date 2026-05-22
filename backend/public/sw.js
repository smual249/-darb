self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('darb-v1').then(c => c.addAll(['/','/manifest.json'])));
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('أنت أوفلاين', {status:200}))));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.data?.url || '/';
  clients.matchAll({type:'window'}).then(cls => {
    for (const c of cls) { if (c.url.includes(url)) return c.focus(); }
    clients.openWindow(url);
  });
});
