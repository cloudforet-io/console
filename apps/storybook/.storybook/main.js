// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const postCssLoader = {
    loader: 'postcss-loader',
    // eslint-disable-next-line global-require
    options: require('../postcss.config.js'),
};

module.exports = {
    stories: [
        '../../../packages/mirinae/src/**/*.stories.mdx',
        '../../../packages/mirinae/src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-a11y',
        '@storybook/addon-storysource',
        '@storybook/addon-google-analytics',
        'storybook-addon-designs',
        '@storybook/addon-essentials',
        '@storybook/addon-docs',
    ],
    webpackFinal: async (config) => {
    // HACK do not allow Storybook to transform ES6 modules to ES5, to avoid a Babel bug that
        // breaks dynamic source code display
        // https://github.com/storybookjs/storybook/issues/13721#issuecomment-827919425
        config.module.rules = config.module.rules.filter((rule) => typeof rule.include !== 'function'
        || !rule.include.toString().includes('nodeModulesThatNeedToBeParsedBecauseTheyExposeES6'));

        /* alis settings */
        config.resolve.alias = {
            vue: 'vue/dist/vue.common.js',
            '@': path.resolve(__dirname, '../../../packages/mirinae/src'),
            fs: path.resolve(__dirname, 'fsMock.js')
        };

        /* SASS settings */
        config.module.rules.push({
            test: /\.s?css$/,
            use: ['style-loader', 'css-loader',
                {
                    loader: 'sass-loader',
                    options: {
                        // eslint-disable-next-line global-require
                        implementation: require('sass'),
                    },
                },
            ],
            include: path.resolve(__dirname, '../../../packages/mirinae/'),
        });

        /* POSTCSS settings */
        config.module.rules.push({
            test: /\.(postcss|pcss)$/,
            use: ['style-loader', 'css-loader', postCssLoader],
            include: path.resolve(__dirname, '../../../packages/mirinae/'),
        });

        /* for 'Can't import the named export from non EcmaScript module' issue while using '@vueuse/components' */
        /* https://github.com/vuejs/pinia/issues/675 */
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
        });

        return config;
    },


};
