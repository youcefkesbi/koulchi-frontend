import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_PORT || 5173)
  
  return {
    plugins: [
      vue(), 
      tailwindcss()
    ],
    server: {
      port: devPort,
      open: true,
      env: env
    },
    build: {
      chunkSizeWarningLimit: 2000,
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            supabase: ['@supabase/supabase-js']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        vue: 'vue/dist/vue.esm-bundler.js',
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    envPrefix: 'VITE_',
    envDir: process.cwd(),
    env: {
      development: loadEnv('development', process.cwd(), ''),
      production: loadEnv('production', process.cwd(), '')
    }
  }
}) 