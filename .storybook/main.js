 // { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
 const path = require('path');
 const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  stories: [
    '../src/*.stories.(js|mdx)',
    '../src/**/*.stories.(js|mdx)',
    '../src/**/**/*.stories.(js|mdx)',
    '../src/**/**/**/*.stories.js',
    '../src/**/**/**/**/*.stories.js',
    '../src/**/**/**/**/**/*.stories.js',
    '../src/**/**/**/**/**/**/*.stories.js',

  ],
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-links/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-storysource/register',
    '@storybook/addon-viewport/register',
    // {
    //   name:'@storybook/addon-viewport/register',
    //   // options:  {
    //   //   viewports: INITIAL_VIEWPORTS
    //   // },
    // },
    '@storybook/addon-a11y/register',
    '@storybook/addon-docs/register',
    'storybook-addon-vue-info/lib/register',
  ],
  webpack:  (config) => {
    config.module.rules.push(
      {
        test: /\.s?css$/,
        loaders: ['style-loader', 'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          },
          // {
          //   loader: 'sass-loader',
          //   options: {
          //     data: `@import "~@/styles/_variables.scss";`
          //   }
          // },
        ],
        include: path.resolve(__dirname, '../'),
        exclude:[path.resolve(__dirname, '..', 'node_modules/monaco-editor')]

      }
    );
    config.resolve.alias = {
      node_modules: path.resolve('./node_modules'),
      'vue': 'vue/dist/vue.common.js',
      '@': path.resolve(__dirname, '../src'),
      '@sb': path.resolve(__dirname, './'),
    };
    config.module.rules.push({
      test: /\.vue$/,
      loader: 'storybook-addon-vue-info/loader',
      enforce: 'post'
    })
    config.plugins.push(new MonacoWebpackPlugin({
      languages:['javascript','json','css','html']
    }))
    return config;
  },
};

