module.exports = {
    presets: [
        '@babel/preset-env',
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        // eslint-disable-next-line func-names
        function () {
            return {
                visitor: {
                    MetaProperty(path) {
                        path.replaceWithSourceString('process');
                    },
                },
            };
        },
    ],
};
