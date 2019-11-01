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
                @import "~@/assets/style/_variables.scss";
                `,
            },
        },
    },
    configureWebpack: {
        resolve: {
        },
        devtool: 'source-map',
    },
};
