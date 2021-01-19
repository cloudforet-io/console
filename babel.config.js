module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
    ],
    env: {
        test: {
            presets: [
                ['@babel/preset-env', {
                    targets: { browsers: ['last 2 versions', 'ie >= 11'] },
                    useBuiltIns: 'usage',
                    shippedProposals: true,
                    corejs: { version: 3.6, proposals: true },
                }]
            ],
        },
    },
    plugins: [
        [
            '@babel/plugin-transform-runtime',
            {
                absoluteRuntime: false,
                corejs: 3,
                helpers: true,
                regenerator: true,
                useESModules: false,
            },
        ],
    ],
};
