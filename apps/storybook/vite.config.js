import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../../packages/mirinae/src'),
            // "@storybook/blocks": path.resolve(__dirname, "../../node_modules/@storybook/blocks"),
            // 'react': path.resolve(__dirname, '../../node_modules/react'),
            // 'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
        },
    },
    optimizeDeps: {
        include: ['@/styles/colors.cjs', '@/styles/web-fonts.cjs', '@/styles/screens.cjs', '@/styles/variables.cjs'],
    },
    rollupInputOptions: {
        plugins: [commonjs()]
    }
});