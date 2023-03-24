import path from 'path';
import process from 'process';
import glob from 'glob';
import fs from 'fs';

import vuePlugin from '@vitejs/plugin-vue2';
import { defineConfig, loadEnv } from 'vite';
import StylelintPlugin from 'vite-plugin-stylelint';
import VueTypeImports from 'vite-plugin-vue-type-imports';

const isPackageLinked = (packageName) => new Promise((resolve, reject) => {
    if (!packageName) reject(new Error('No argument'));

    const packagePath = path.resolve(__dirname, `../../node_modules/${packageName}`)
    glob(packagePath, (err, foundPaths) => {
        if (err) reject(err)

        if (!foundPaths.length) reject(new Error(packageName + ' package is not installed'));
        foundPaths.forEach((foundPath) => {
            fs.lstat(foundPath, (e, stats) => {
                if (e) reject(e)

                if (stats.isSymbolicLink()) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    })
})


export default defineConfig(async ({ command, mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};
    if (command === 'serve') { console.log('serve mode') }
    else { console.log('build mode') }

    let mirinaeLinked = false;
    if (command === 'serve') {
        try {
            mirinaeLinked = await isPackageLinked('@spaceone/design-system')
        } catch (e) {
            console.warn(e)
        }
    }

    return {
        optimizeDeps: {
            include: mirinaeLinked ? ['@spaceone/design-system/tailwind.config.cjs'] : [],
        },
        plugins: [
            vuePlugin(),
            VueTypeImports(),
            StylelintPlugin({
                include: ['src/**/*.{css,vue,pcss,scss}'],
                exclude: ['node_modules'],
                lintOnStart: false,
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
                '@cloudforet/core-lib': path.resolve(__dirname, '../../packages/core-lib/dist/'),
                '@cloudforet/language-pack': path.resolve(__dirname, '../../packages/language-pack/'),
                vue: path.resolve(__dirname, '../../node_modules/vue/dist/vue.js'),
            },
        },
        define: {
            VITE_APP_VER: JSON.stringify(process.env.npm_package_version),
            // Add env variables here
            // Usage references => SignInLeftContainer.vue / env.d.ts
        },
    };
});
