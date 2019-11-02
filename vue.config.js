const path = require('path');

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
            },
        },
    },
    configureWebpack: {
        resolve: {
            alias: {
                // eslint-disable-next-line camelcase
                node_modules: path.resolve('./node_modules'),
            },
        },
        devtool: 'source-map',
    },
};
