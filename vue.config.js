module.exports = {
    lintOnSave: false,
    runtimeCompiler: true,
    devServer: {
        host: 'cloudone.console.dev.pyengine.net',
        port: 8080
    },
    css: {
        loaderOptions: {
            sass: {
                data: `
                @import "~@/assets/style/_variables.scss";
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
