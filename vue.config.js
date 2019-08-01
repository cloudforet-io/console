// eslint-disable-next-line no-undef
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
                @import "~@/asset/scss/_variables.scss";
            `
            }
        }
    }
};
