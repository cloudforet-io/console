/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import vue from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../../packages/mirinae/src'),
            'vue/dist/vue.esm': path.resolve(__dirname, '../../node_modules/vue/dist/vue.esm.js'),
            'vue-router/composables': path.resolve(__dirname, './mock/vue-router-composables.ts'),
        },
    },
    optimizeDeps: {
        include: ['mirinae-foundation/web-fonts.cjs', 'mirinae-foundation/screens.cjs', '@/styles/colors.cjs'],
    },
    rollupInputOptions: {
        plugins: [commonjs()],
    },
});
