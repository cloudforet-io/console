import process from 'process';
import { fileURLToPath, URL } from 'url';

import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import stylelint from 'vite-plugin-stylelint';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async ({ command, mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    if (command === 'serve') console.log('serve mode');
    else console.log('build mode');

    return {
        optimizeDeps: {
            include: [
                '@spaceone/design-system/tailwind.config.cjs',
                'prosemirror-state',
                'prosemirror-transform',
                'prosemirror-model',
                'prosemirror-view',
            ],
        },
        plugins: [
            vue(),
            stylelint({
                include: ['src/**/*.{css,vue,pcss,scss}'],
                exclude: ['node_modules'],
                lintOnStart: false,
                emitErrorAsWarning: true,
            }),
            ...(process.env.NODE_ENV === 'production' ? [] : [visualizer({
                emitFile: true,
                filename: 'stats.html',
            })]),
            tsconfigPaths(),
        ],
        build: {
            rollupOptions: {
                external: ['@spaceone/design-system/css/*'],
            },
        },
        server: { port: 8080 },
        preview: { port: 8080 },
        test: {
            globals: true,
            environment: 'jsdom',
            include: ['./src/**/__tests__/**/*.+(ts|js)'],
        },
        resolve: {
            alias: [
                // '@/': path.resolve(__dirname, './src/'),
                // '@cloudforet/core-lib': path.resolve(__dirname, '../../packages/core-lib/dist/'),
                // '@cloudforet/language-pack': path.resolve(__dirname, '../../packages/language-pack/'),
                { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
                { find: '@cloudforet/core-lib', replacement: fileURLToPath(new URL('../../packages/core-lib/dist', import.meta.url)) },
                { find: '@cloudforet/language-pack', replacement: fileURLToPath(new URL('../../packages/language-pack', import.meta.url)) },
            ],
        },
        define: {
            VITE_APP_VER: JSON.stringify(process.env.npm_package_version),
            // Add env variables here
            // Usage references => SignInLeftContainer.vue / env.d.ts
        },
    };
});
