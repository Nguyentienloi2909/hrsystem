import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

export default defineConfig({
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
        },
    },
    plugins: [svgr(), react()],
    base: '/',
    build: {
        minify: false,        // Không nén JS/CSS
        sourcemap: false,     // Không tạo file map
        cssCodeSplit: false,  // Gom CSS thành 1 file
    }
});
