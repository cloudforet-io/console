import path from 'path';

import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import vuePlugin from '@vitejs/plugin-vue2';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import StylelintPlugin from 'vite-plugin-stylelint';

export default defineConfig(({ mode }) => ({
    optimizeDeps: {
        exclude: mode === 'test' ? ['vue'] : [],
    },
    build: {
        sourcemap: 'inline',
        lib: {
            entry: {
                mirinae: path.resolve(__dirname, './src/index.ts'),
                hooks: path.resolve(__dirname, './src/hooks/index.ts'),
            },
            name: 'Mirinae',
            fileName: (format, entryName) => `${entryName}.mjs`,
            formats: ['es'],
        },
        rollupOptions: {
            external: [
                'vue',
                'vue-router',
                'vue-i18n',
                '@amcharts/amcharts4',
            ],
            output: {
                globals: {
                    vue: 'Vue',
                    'vue-i18n': 'vue-i18n',
                },
            },
        },
    },
    plugins: [
        viteCommonjs(),
        vuePlugin(),
        StylelintPlugin({
            include: ['src/**/*.{css,vue,pcss,scss}'],
            exclude: ['node_modules'],
            lintOnStart: false,
            emitErrorAsWarning: true,
        }),
        copy({
            targets: [
                { src: 'css', dest: 'dist/' },
            ],
        }),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['./src/**/__tests__/**/*.+(ts|js)'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
}));
