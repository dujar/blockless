import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Blockless Swap',
        short_name: 'Swap DApp',
        description: 'A decentralized application for swapping tokens across chains',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'blockless.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: 'blockless-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'blockless-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})