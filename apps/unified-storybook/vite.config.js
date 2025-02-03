/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import vue from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
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
