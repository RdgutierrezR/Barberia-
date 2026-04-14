/* eslint-disable no-restricted-globals */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

const isDev = self.location.hostname === 'localhost'

// Precache
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// SPA Navigation
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('/index.html')
  )
)

// API Cache Strategy (mejor que NetworkOnly)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 300
      })
    ]
  }),
  'GET'
)


// ===============================
// Push Notifications
// ===============================

self.addEventListener('push', (event) => {

  if (isDev) console.log('[SW] Push received')

  let data = {
    title: 'BarberAPP',
    body: 'Nueva notificación',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    url: '/'
  }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    tag: 'barber-app-notification',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  )
})


// ===============================
// Notification Click
// ===============================

self.addEventListener('notificationclick', (event) => {

  if (isDev) console.log('[SW] Notification click')

  event.notification.close()

  if (event.action === 'close') return

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {

      for (const client of windowClients) {
        if (
          client.url.includes(self.location.origin) &&
          'focus' in client
        ) {
          client.navigate(urlToOpen)
          return client.focus()
        }
      }

      return clients.openWindow(urlToOpen)
    })
  )
})


// ===============================
// Skip Waiting
// ===============================

self.addEventListener('message', (event) => {

  if (isDev) console.log('[SW] Message', event.data)

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})


// ===============================
// Install
// ===============================

self.addEventListener('install', () => {

  if (isDev) console.log('[SW] Installed')

  self.skipWaiting()
})


// ===============================
// Activate
// ===============================

self.addEventListener('activate', (event) => {

  if (isDev) console.log('[SW] Activated')

  event.waitUntil(
    clients.claim()
  )
})


if (isDev) console.log('[SW] Loaded')