import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

// Desactivar logs en producción
self.__WB_DISABLE_DEV_LOGS = true;

// Precache con mejor control de cache
precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/.*/],
});

// No cachear API (siempre red)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly()
);

// ================================
// PUSH NOTIFICATIONS
// ================================

self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || '',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'barber-app-notification',
    requireInteraction: false,
    renotify: false,
    silent: false,
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'BarberAPP', options)
  );
});

// ================================
// CLICK NOTIFICATION
// ================================

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ================================
// INSTALACIÓN
// ================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ================================
// ACTIVACIÓN (LIMPIAR CACHE VIEJO)
// ================================

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Elimina caches antiguos
          if (!cacheName.includes('workbox')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});