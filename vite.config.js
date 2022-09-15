import path from 'path';

import vuePlugin from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        vuePlugin(),
    ],
    server: {
        port: 8080,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@spaceone/console-core-lib': path.resolve(__dirname, './packages/@spaceone/console-core-lib/dist/'),
            vue: path.resolve(__dirname, './node_modules/vue/dist/vue.js'),
        },
    },
});
