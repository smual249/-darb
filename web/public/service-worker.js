const CACHE = 'darb-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/manifest.json'])));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('أنت أوفلاين', { status: 200 })))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.data?.url || '/';
  clients.matchAll({ type: 'window' }).then(cls => {
    for (const c of cls) {
      if (c.url.includes(url)) return c.focus();
    }
    clients.openWindow(url);
  });
});

self.addEventListener('push', e => {
  if (!e.data) return;
  try {
    const data = e.data.json();
    const options = {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      tag: data.tag || 'darb-push',
      requireInteraction: data.urgent || false,
      vibrate: data.intensity >= 2 ? [300, 100, 300, 100, 500] : [200, 100, 200],
      data: { url: data.url || '/' },
    };
    e.waitUntil(self.registration.showNotification(data.title || '🔔 درب', options));
  } catch {}
});

self.addEventListener('backgroundfetchsuccess', e => {
  console.log('Background fetch completed');
});

self.addEventListener('sync', e => {
  if (e.tag === 'darb-voice-command') {
    e.waitUntil(handleVoiceCommand());
  }
});

async function handleVoiceCommand() {
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage({ type: 'voice-command', command: 'يا درب' });
  }
}
