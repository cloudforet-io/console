module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
    ],
    env: {
        test: {
            presets: [[
                '@babel/preset-env', {
                    debug: true,
                },
            ]],
        },
    },
};
