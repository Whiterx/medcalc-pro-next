import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const appBase = '/medcalc-pro-next/'

export default defineConfig({
  base: appBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/icon-192.svg',
        'icons/icon-512.svg',
        'icons/maskable-512.svg',
      ],
      manifest: {
        id: appBase,
        name: 'MediCalc Pro',
        short_name: 'MediCalc',
        description: 'Клинические калькуляторы, шкалы и практические инструменты для врачей',
        theme_color: '#101827',
        background_color: '#f4f7fb',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'any',
        start_url: appBase,
        scope: appBase,
        lang: 'ru',
        categories: ['medical', 'productivity', 'utilities'],
        icons: [
          {
            src: appBase + 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: appBase + 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: appBase + 'icons/maskable-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'NEWS2',
            short_name: 'NEWS2',
            description: 'Открыть шкалу NEWS2',
            url: appBase + 'calculators/news2',
            icons: [{ src: appBase + 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
          {
            name: 'CURB-65',
            short_name: 'CURB-65',
            description: 'Открыть шкалу CURB-65',
            url: appBase + 'calculators/curb-65',
            icons: [{ src: appBase + 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest,woff2}'],
        navigateFallback: appBase + 'index.html',
        navigateFallbackDenylist: [/^\/medcalc-pro-next\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
})
