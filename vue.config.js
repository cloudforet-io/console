const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

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
        },
    },
    configureWebpack: {
        resolve: {
            alias: {
                // eslint-disable-next-line camelcase
                node_modules: path.resolve('./node_modules'),
                '@sb': path.resolve('./.storybook'),
            },
        },
        devtool: 'source-map',
        plugins: [
            new MonacoWebpackPlugin({
                languages: ['json', 'html', 'python', 'javascript', 'css'],
            }),
        ],
    },

};
