import path from 'path';

import vuePlugin from '@vitejs/plugin-vue2';
import { defineConfig, loadEnv } from 'vite';
import StylelintPlugin from 'vite-plugin-stylelint';

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.env.npm_package_version, '');
    if (command === 'serve') {
        console.log('serve mode');
    } else {
        console.log('build mode');
    }

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
        server: {
            port: 8080,
        },
        test: {
            globals: true,
            environment: 'jsdom',
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@/*': path.resolve(__dirname, './src/*'),
                '@spaceone/console-core-lib': path.resolve(__dirname, './packages/@spaceone/console-core-lib/dist/'),
                'cloudforet/core-lib': path.resolve(__dirname, './packages/cloueforet/core-lib/dist/'),
                'cloudforet/language-pack': path.resolve(__dirname, './packages/cloueforet/language-pack/'),
                vue: path.resolve(__dirname, './node_modules/vue/dist/vue.js'),
            },
        },
        define: {
            __APP_VER__: JSON.stringify(env.npm_package_version),
        },
    };
});
