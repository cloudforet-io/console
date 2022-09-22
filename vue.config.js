/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const CompressionPlugin = require('compression-webpack-plugin');
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');

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
                sassOptions: {
                    includePaths: ['./node_modules'],
                },
            },
        },
    },
    configureWebpack: {
        devtool: 'source-map',
        resolve: {
            /* The code below is for npm link case */
            symlinks: false,
            alias: {
                '@spaceone/console-core-lib': path.resolve(__dirname, './packages/@spaceone/console-core-lib/dist/'),
                packages: path.resolve(__dirname, './packages/'),
                vue: path.resolve('./node_modules/vue'),
            },
        },
        plugins: [
            new CompressionPlugin(),
            ...extraPlugins,
        ],
        // eslint-disable-next-line consistent-return
        externals(context, request, callback) {
            if (/xlsx|canvg/.test(request)) {
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
    parallel: false,
};
