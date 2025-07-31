import { defineConfig, loadEnv } from 'vite'; // Import loadEnv
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), ''); // Prefix '' loads all vars

  return {
    css: {
      postcss: {
        plugins: [tailwindcss],
      },
    },
    plugins: [
      react(),
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
    ],
    server: {
      headers: {
        'Cache-Control': 'no-store'
      },
      proxy: {
        '/api': {
          target: 'https://api.1inch.dev', // Target base URL
          changeOrigin: true, // Needed for virtual hosted sites
          // Rewrite the path to remove `/api` prefix before sending to target
          // e.g., /api/token/v1.3/multi-chain/supported-chains
          // becomes /token/v1.3/multi-chain/supported-chains
          rewrite: (path) => path.replace(/^\/api/, ''),
          // Configure the proxy to add the Authorization header
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add the Authorization header using the environment variable
              // Make sure VITE_ONE_INCH_API_KEY is set in your .env file
              const apiKey = env.VITE_ONE_INCH_API_KEY; // Note: VITE_ prefix for client-side access
              // Optionally remove the original auth header if sent by the client
              // to ensure the proxy's key is used.
              proxyReq.removeHeader('authorization'); // Remove lowercase 'a'
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
              } else {
                console.warn('Warning: VITE_ONE_INCH_API_KEY not found in environment variables for proxy.');
                // Depending on strictness, you might want to throw an error or handle this differently
              }
            });
          },
        }
      }
    }
  }
});