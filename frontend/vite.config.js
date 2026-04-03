import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'BarberAPP',
        short_name: 'BarberAPP',
        description: 'Agenda digital para barberías',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      devOptions: { enabled: true },
      strategies: 'generateSW',
      runtimeCaching: [{
        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
        handler: 'NetworkOnly'
      }],
      swDest: 'dist/sw.js',
      swSrc: 'public/sw.js'
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
