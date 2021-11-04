// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        devtool: 'source-map',
        plugins: [
            ...extraPlugins,
        ],
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    loader: 'vue-loader',
                    options: {
                        esModule: false,
                    },
                },
            ],
        },
    },
    chainWebpack: (config) => {
        config.module
            .rule('images')
            .test(/\.(png|jpe?g|gif)$/i)
            .use('url-loader')
            .loader('url-loader')
            .tap(options => Object.assign(options, { limit: false }));

        /* These are some necessary steps changing the default webpack config of the Vue CLI
           that need to be changed in order for Typescript based components to generate their
           declaration (.d.ts) files.
           Discussed here https://github.com/vuejs/vue-cli/issues/1081
            */
        config.module.rule('ts').uses.delete('cache-loader');

        config.module
            .rule('ts')
            .use('ts-loader')
            .loader('ts-loader')
            .tap((opts) => {
                opts.transpileOnly = false;
                opts.happyPackMode = false;
                opts.configFile = 'tsconfig.build.json';
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
