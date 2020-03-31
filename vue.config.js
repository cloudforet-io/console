/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const postcssConfig = require('./postcss.config');

const extraPlugins = [];
// if (process.env.NODE_ENV === 'development') {
//     extraPlugins.push(
//         new StylelintPlugin({
//             files: ['src/**/*.{vue,scss}'],
//         }),
//     );
// }

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
        plugins: [
            new MonacoWebpackPlugin({
                languages: ['json', 'html', 'python', 'javascript', 'css'],
            }),
            ...extraPlugins,
        ],
    },

};
