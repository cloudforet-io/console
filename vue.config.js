/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
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
    publicPath: '/',
    css: {
        loaderOptions: {
            postcss: postcssConfig,
            sass: {
                includePaths: ['./node_modules'],
            },
        },
    },
    configureWebpack: {
        devtool: 'source-map',
        resolve: {
            /* The code below is for npm link case */
            symlinks: false,
            alias: {
                '@vue/composition-api': path.resolve(__dirname, './node_modules/@vue/composition-api/'),
            },
        },
        plugins: [
            new CompressionPlugin(),
            ...extraPlugins,
        ],
        // eslint-disable-next-line consistent-return
        externals(context, request, callback) {
            if (/xlsx|canvg|pdfmake/.test(request)) {
                return callback(null, `commonjs ${request}`);
            }
            callback();
        },
        optimization: {
            runtimeChunk: true,
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        chunks: 'initial',
                        name: 'vendor',
                        enforce: true,
                    },
                },
            },
        },
    },
    chainWebpack: (config) => {
        // These are some necessary steps changing the default webpack config of the Vue CLI
        // that need to be changed in order for Typescript based components to generate their
        // declaration (.d.ts) files.
        //
        // Discussed here https://github.com/vuejs/vue-cli/issues/1081
        config.output.chunkFilename('[id].[chunkhash:8].js');
    },
    parallel: false,
};
