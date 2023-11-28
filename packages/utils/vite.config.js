import path from 'path';

import { defineConfig } from 'vite';

export default defineConfig(() => ({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['./**/__tests__/**/*.+(ts|js)'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
}));
