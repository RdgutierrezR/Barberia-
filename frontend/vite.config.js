import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      strategies: 'injectManifest',

      srcDir: 'src',
      filename: 'custom-sw.js',

      registerType: 'autoUpdate',

      injectRegister: false,

      includeAssets: [
        'favicon.ico',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],

      injectManifest: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}'
        ],
        maximumFileSizeToCacheInBytes: 5000000
      },

      manifest: {
        name: 'BarberAPP',
        short_name: 'BarberAPP',
        description: 'Sistema de gestión para barberías',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],

  server: {
    host: '0.0.0.0',
    port: 5173
  }
})