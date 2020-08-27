/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const postcssConfig = require('./postcss.config');


const extraPlugins = [];
if (process.env.NODE_ENV === 'development') {
    // const StylelintPlugin = require('stylelint-webpack-plugin');

    // extraPlugins.push(
    // new StylelintPlugin({
    //     files: ['src/**/*.{vue,scss}'],
    // }),
    // );
}

if (process.env.VUE_APP_ANALYZE_MOD) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    extraPlugins.push(
        new BundleAnalyzerPlugin(),
    );
}


module.exports = {
    lintOnSave: false,
    runtimeCompiler: true,
    devServer: {
        disableHostCheck: true,
        port: 8080,
    },
    css: {
        loaderOptions: {
            sass: {
                includePaths: ['./node_modules'],
                excludePaths: [path.resolve(__dirname, '..', 'node_modules/monaco-text-editor')],
            },
            postcss: postcssConfig,
        },
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@sb': path.resolve('./.storybook'),
            },
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                esModule: false, // <- here
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new MonacoWebpackPlugin({
                languages: ['json', 'html', 'python', 'javascript', 'css'],
            }),
            ...extraPlugins,
        ],
    },
    chainWebpack: (config) => {
        // These are some necessary steps changing the default webpack config of the Vue CLI
        // that need to be changed in order for Typescript based components to generate their
        // declaration (.d.ts) files.
        //
        // Discussed here https://github.com/vuejs/vue-cli/issues/1081
        if (process.env.NODE_ENV === 'production' && process.env.VUE_APP_BUILD_MOD === 'lib') {
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
        }
    },
    parallel: false,
};
