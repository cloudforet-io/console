import path from 'path';
import process from 'process';

import vuePlugin from '@vitejs/plugin-vue2';
import { defineConfig, loadEnv } from 'vite';
import StylelintPlugin from 'vite-plugin-stylelint';

export default defineConfig(({ command, mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};
    if (command === 'serve') { console.log('serve mode') }
    else { console.log('build mode') }

    return {
        plugins: [
            vuePlugin(),
            StylelintPlugin({
                include: ['src/**/*.{css,vue,pcss,scss}'],
                exclude: ['node_modules'],
                lintOnStart: true,
                emitErrorAsWarning: true,
            }),
        ],
        server: { port: 8080 },
        preview: { port: 8080 },
        test: {
            globals: true,
            environment: 'jsdom',
            include: ['./src/**/__tests__/**/*.+(ts|js)'],
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@cloudforet/core-lib': path.resolve(__dirname, './packages/cloudforet/core-lib/dist/'),
                '@cloudforet/language-pack': path.resolve(__dirname, './packages/cloudforet/language-pack/'),
                vue: path.resolve(__dirname, './node_modules/vue/dist/vue.js'),
            },
        },
        define: {
            VITE_APP_VER: JSON.stringify(process.env.npm_package_version),
            // Add env variables here
            // Usage references => SignInLeftContainer.vue / env.d.ts
        },
    };
});
