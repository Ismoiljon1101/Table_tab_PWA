import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.PORT || '5173', 10);

  return {
    plugins: [
      tailwindcss(),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/*.png'],
        manifest: {
          name: 'TableTap - Waiter Assistant',
          short_name: 'TableTap',
          description: 'Smart order-taking for restaurant staff',
          theme_color: '#D97706',
          background_color: '#FFF8F0',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/.*\/v1\/(menu|categories|tables|sections)/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      host: true,
      port: port,
      strictPort: true, // Never fall back to another port — fail loudly if 5100 is in use
      /**
       * Vite dev proxy: all /v1/* requests are forwarded to the NestJS backend.
       * This COMPLETELY eliminates CORS issues in development — the browser
       * only ever talks to localhost:5100, and Vite proxies internally.
       * Set VITE_BACKEND_URL in .env to change the target (default: 3500).
       */
      proxy: {
        '/v1': {
          target: env.VITE_BACKEND_URL || 'http://localhost:3500',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})

