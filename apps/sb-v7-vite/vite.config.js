import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../../packages/mirinae/src'),
            "@storybook/blocks": path.resolve(__dirname, "./node_modules/@storybook/blocks")
        },
    },
    optimizeDeps: {
        include: ['@/styles/colors.cjs', '@/styles/web-fonts.cjs', '@/styles/screens.cjs'],
    },
    rollupInputOptions: {
        plugins: [commonjs()]
    }
});