const path = require('path');

module.exports = async ({ config, mode }) => {
    config.module.rules.push(
        {
            test: /\.s?css$/,
            loaders: ['style-loader', 'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => [require('autoprefixer')]
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        data: `
                        @import "~@/assets/style/_variables.scss";
                        `

                    }
                },
            ],
            include: path.resolve(__dirname, '../')
        }
    );
    config.resolve.alias = {
        'vue': 'vue/dist/vue.common.js',
        '@': path.resolve(__dirname, '../src'),
    };
    config.module.rules.push({
        test: /\.vue$/,
        loader: 'storybook-addon-vue-info/loader',
        enforce: 'post'
    })
    return config;
};