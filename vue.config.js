/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');
// eslint-disable-next-line import/no-extraneous-dependencies
const CopyPlugin = require('copy-webpack-plugin');
const postcssConfig = require('./postcss.config');


/** ********************************************
 *     Set additional environment variables    *
 * ******************************************* */
process.env.VUE_APP_VERSION = require('./package.json').version;


/** ********************************************
 *        Set additional webpack plugins       *
 * ******************************************* */
const extraPlugins = [];

if (process.env.NODE_ENV === 'development') {
    // const StylelintPlugin = require('stylelint-webpack-plugin');

    // extraPlugins.push(
    // new StylelintPlugin({
    //     files: ['src/**/*.{vue,scss,pcss}'],
    // }),
    // );
}

if (process.env.VUE_APP_ANALYZE_MOD) {
    const BundleAnalyzerPlugin = webpackBundleAnalyzer.BundleAnalyzerPlugin;
    extraPlugins.push(
        new BundleAnalyzerPlugin(),
    );
}


/** ********************************************
 *              Set Vue CLI config             *
 * ******************************************* */
module.exports = {
    lintOnSave: false,
    runtimeCompiler: true,
    devServer: {
        disableHostCheck: true,
        port: 8080,
    },
    css: {
        loaderOptions: {
            postcss: postcssConfig,
            sass: {
                includePaths: ['./node_modules'],
            },
        },
        extract: false,
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@sb': path.resolve('./.storybook'),
            },
        },
        devtool: 'source-map',
        plugins: [
            // new CopyPlugin([{
            //     from: './public/**/*',
            //     transformPath(targetPath) {
            //         return `${targetPath.slice(7)}`;
            //     },
            // }]),
            ...extraPlugins,
        ],
    },
    chainWebpack: (config) => {
        if (process.env.VUE_APP_BUILD_MOD === 'wc') {

        }
        // These are some necessary steps changing the default webpack config of the Vue CLI
        // that need to be changed in order for Typescript based components to generate their
        // declaration (.d.ts) files.
        //
        // Discussed here https://github.com/vuejs/vue-cli/issues/1081
        config.module.rule('ts').uses.delete('cache-loader');

        config.module
            .rule('ts')
            .use('ts-loader')
            .loader('ts-loader')
            .tap((opts) => {
                opts.transpileOnly = false;
                opts.happyPackMode = false;
                opts.configFile = 'tsconfig.json';
                return opts;
            });

        config.externals([
            '@vue/composition-api',
            'vue-i18n',
            'vue-svgicon',
            'velocity-animate',
            'vue-notification',
            'vue-fragment',
            'v-tooltip',
        ]);
    },
    parallel: false,
};
