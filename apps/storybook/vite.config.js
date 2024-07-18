import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../../packages/mirinae/src'),
            'vue/dist/vue.esm': path.resolve(__dirname, '../../node_modules/vue/dist/vue.esm.js'),
        },
    },
    optimizeDeps: {
        include: ['@/styles/colors.cjs', '@/styles/web-fonts.cjs', '@/styles/screens.cjs', '@/styles/variables.cjs', '@/styles/font-size.cjs', '@/index'],
    },
    rollupInputOptions: {
        plugins: [commonjs()]
    }
});