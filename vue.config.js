const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// const StyleLintPlugin = require('stylelint-webpack-plugin');
const postcssConfig = require('./postcss.config');

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
                data: `
                @import "~@/styles/_variables.scss";
                `,
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
            // new StyleLintPlugin({
            //     files: ['src/**/*.{vue}'],
            // }),
        ],
    },

};
