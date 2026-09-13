import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@shared': resolve(__dirname, 'src/shared'),
            '@user': resolve(__dirname, 'src/user'),
            '@admin': resolve(__dirname, 'src/admin'),
        },
    },
    server: {
        port: 5173,
    },
});