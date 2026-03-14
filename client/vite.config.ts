import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [tailwindcss(), react(), svgr()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://43.99.84.121:5000',
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'http://43.99.84.121:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
