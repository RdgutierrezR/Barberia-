const fs = require('fs');
const path = require('path');

const pushHandlers = `

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  let data = { title: 'BarberAPP', body: 'Nueva notificación', icon: '/pwa-192x192.png', badge: '/pwa-192x192.png' };
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data.body = event.data.text(); }
  }
  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/', timestamp: Date.now() },
    tag: 'barber-app-notification'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
    for (const client of windowClients) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.navigate(urlToOpen);
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(urlToOpen);
  }));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

console.log('[SW] Push handlers injected');
`;

const swPath = path.join(__dirname, 'dist', 'sw.js');

if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  const injectPoint = swContent.lastIndexOf('});');
  if (injectPoint > 0) {
    swContent = swContent.slice(0, injectPoint) + ';' + pushHandlers + swContent.slice(injectPoint + 1);
    fs.writeFileSync(swPath, swContent);
    console.log('Push handlers injected into sw.js');
  }
}