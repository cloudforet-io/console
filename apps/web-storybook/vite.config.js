import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import vue from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../web/src'),
            '@cloudforet/core-lib': path.resolve(__dirname, '../../packages/core-lib/dist/'),
            '@cloudforet/utils': path.resolve(__dirname, '../../packages/utils/dist/'),
            '@cloudforet/language-pack': path.resolve(__dirname, '../../packages/language-pack/'),
            'vue/dist/vue.esm': path.resolve(__dirname, '../../node_modules/vue/dist/vue.esm.js'),
        },
    },
    optimizeDeps: {
        include: ['mirinae-foundation/web-fonts.cjs', 'mirinae-foundation/screens.cjs'],
    },
    rollupInputOptions: {
        plugins: [commonjs()],
    },
});
