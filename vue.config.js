// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackBundleAnalyzer = require('webpack-bundle-analyzer');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const postcssConfig = require('./postcss.config.cjs');


/** ********************************************
 *     Set additional environment variables    *
 * ******************************************* */
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
                sassOptions: {
                    includePaths: ['./node_modules'],
                },
            },
        },
        extract: false,
    },
    configureWebpack: {
        devtool: 'source-map',
        plugins: [
            ...extraPlugins,
        ],
        /*
        Below is a code that removes unnecessary modules to bundling.
        The modules that are removed are modules that are already installed in the application or too large.
         Related issue: https://github.com/amcharts/amcharts4/issues/82#issuecomment-607546562
         */
        // eslint-disable-next-line consistent-return
        externals(context, request, callback) {
            if (/^vue$|@vue\/vue-router|vue-i18n|vue-fragment|@amcharts/.test(request)) {
                return callback(null, `commonjs ${request}`);
            }
            callback();
        },
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
    },
    parallel: false,
};
