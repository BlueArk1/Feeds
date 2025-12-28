import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import inject from '@rollup/plugin-inject'

export default defineConfig({
    plugins: [
        vue(),
        inject({
            Buffer: ['buffer', 'Buffer']   // ⬅️ add global Buffer polyfill
        })
    ],
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://192.168.0.24:4000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        }
    },
    optimizeDeps: {
        include: ['buffer']   // ⬅️ ensure Vite pre-bundles Buffer
    }
})
