module.exports = {
    lintOnSave: false,
    runtimeCompiler: true,
    devServer: {
        host: 'localhost'
    },
    css: {
        loaderOptions: {
            sass: {
                data: `
                @import "~@/asset/style/_variables.scss";
                @import "~@/asset/style/_font.scss";
                `
            }
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
            }
        },
        devtool: 'source-map'
    }
};
