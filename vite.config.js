import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        hmr: {
            overlay: false
        }
    },
    build: {
        target: 'esnext', 
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Pecah kode (Code Splitting) agar loading di Vercel jauh lebih cepat
                    if (id.includes('node_modules')) {
                        return 'vendor'; 
                    }
                    if (id.includes('gsap')) {
                        return 'gsap-core';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 2000, 
    },
    esbuild: {
        // Otomatis menghapus semua console.log di production untuk hemat memori client
        drop: ['console', 'debugger'], 
    }
})