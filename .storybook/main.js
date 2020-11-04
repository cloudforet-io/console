 // { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
 const path = require('path');
const postCssLoader = {
        loader: 'postcss-loader',
        options: require('./postcss.config'),
    };

module.exports = {
  stories: [
    '../src/**/*.stories.js',
  ],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-knobs',
    '@storybook/addon-storysource',
    '@storybook/addon-viewport',
      '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
          vueDocgenOptions: { alias: { '@': path.resolve(__dirname, '../src') }},
      }
    },
    '@storybook/addon-google-analytics',
    'storybook-addon-designs/register'
  ],
  webpackFinal:  async (config) => {

    /* Typescript settings */
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: 'ts-loader',
    include: [
        path.resolve(__dirname, '../src/components'),
    ],
      exclude: /node_modules/,
      options: {
        appendTsSuffixTo: [/\.vue$/],
      },
    });
    config.resolve.extensions.push('.ts', '.tsx');

    /* alis settings */
    config.resolve.alias = {
      'vue': 'vue/dist/vue.common.js',
      '@': path.resolve(__dirname, '../src'),
      '@sb': path.resolve(__dirname, './'),
      'fs': path.resolve(__dirname, 'fsMock.js'),
    };

      /* SASS settings */
      config.module.rules.push(
          {
              test: /\.s?css$/,
              use: ['style-loader', 'css-loader',
                  {
                      loader: 'sass-loader',
                  },
              ],
              include: path.resolve(__dirname, '../'),
          }
      );

      /* POSTCSS settings */
      config.module.rules.push(
          {
              test: /\.(postcss|pcss)$/,
              use: ['style-loader', 'css-loader', postCssLoader],
              include: path.resolve(__dirname, '../'),
          }
      );

    return config;
  },
};

