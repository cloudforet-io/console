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
            postcss: {
                parser: 'postcss-scss',
                plugins: () => [
                    require('tailwindcss'),
                    require('autoprefixer'),
                    require('postcss-simple-vars'),
                    require('postcss-mixins'),
                    require('postcss-easy-import')({
                        path: ['src', 'node_modules'],
                    }),
                    require('postcss-preset-env')({ stage: 3 }),
                ],
            },
        },
    },

    configureWebpack: {
        resolve: {
            alias: {
                // eslint-disable-next-line camelcase
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
