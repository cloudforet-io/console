module.exports = {
    presets: [
        '@babel/preset-env',
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        function () {
            return {
                visitor: {
                    MetaProperty(path) {
                        path.replaceWithSourceString('process')
                    },
                },
            }
        },
    ],
};
