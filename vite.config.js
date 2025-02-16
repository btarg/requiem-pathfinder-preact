import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        preact(),
        {
            name: 'copy-404',
            writeBundle() {
                writeFileSync(
                    resolve(__dirname, 'dist/404.html'),
                    readFileSync(resolve(__dirname, 'public/404.html'))
                );
            }
        }
    ],
    base: '/requiem-pathfinder-preact/',
});