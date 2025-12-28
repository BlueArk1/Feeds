import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import inject from '@rollup/plugin-inject'

export default defineConfig({
    plugins: [
        vue(),
        inject({
            Buffer: ['buffer', 'Buffer']
        })
    ],
    server: {
        host: true,
        port: 5173,
        allowedHosts: ['feed.protogen.tools'], // <-- add this line
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        }
    },
    optimizeDeps: {
        include: ['buffer']
    }
})
