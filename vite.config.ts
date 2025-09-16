import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_DEV_PROXY_TARGET
  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    server: {
      port: 5173,
      open: true,
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api/, '')
            }
          }
        : undefined
    },
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
        }
      }
    }
  }
})
