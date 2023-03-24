import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ command, mode }) => {
    return {
        test: {
            globals: true,
            environment: 'jsdom',
            include: ['./**/__tests__/**/*.+(ts|js)'],
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                vue: path.resolve(__dirname, '../../node_modules/vue/dist/vue.js'),
            },
        },
    };
});
