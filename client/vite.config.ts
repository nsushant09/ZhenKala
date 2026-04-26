import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [tailwindcss(), react(), svgr()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://zhenkala.com:5001',
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'http://zhenkala.com:5001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
