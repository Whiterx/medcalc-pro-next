import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/medcalc-pro-next/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'MediCalc Pro',
        short_name: 'MediCalc',
        description: 'Медицинские калькуляторы и клинические шкалы для обучения',
        theme_color: '#101827',
        background_color: '#f4f7fb',
        display: 'standalone',
        start_url: '/medcalc-pro-next/',
        scope: '/medcalc-pro-next/',
        lang: 'ru',
        icons: []
      }
    })
  ]
})