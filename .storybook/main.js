 // { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
 const path = require('path');
 const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const postCssLoader = {
        loader: 'postcss-loader',
        options: require('../postcss.config'),
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
  ],
  webpackFinal:  async (config) => {

    /* Typescript settings */
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        appendTsSuffixTo: [/\.vue$/],
      },
    });
    config.resolve.extensions.push('.ts', '.tsx');

    /* SASS settings */
    config.module.rules.push(
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader',postCssLoader,
          {
            loader: 'sass-loader',
          },
        ],
        include: path.resolve(__dirname, '../'),
        exclude:[
            path.resolve(__dirname, '..', 'node_modules/monaco-editor'),
          path.resolve(__dirname, '..', 'node_modules.nosync/monaco-editor'),

        ],
      }
    );

    /* SASS settings */
    config.module.rules.push(
        {
          test: /\.postcss$/,
          use: ['style-loader', 'css-loader',postCssLoader,],
          include: path.resolve(__dirname, '../'),
          exclude:[
            path.resolve(__dirname, '..', 'node_modules/monaco-editor'),
            path.resolve(__dirname, '..', 'node_modules.nosync/monaco-editor'),

          ],
        }
    );

    /* alis settings */
    config.resolve.alias = {
      'vue': 'vue/dist/vue.common.js',
      '@': path.resolve(__dirname, '../src'),
      '@sb': path.resolve(__dirname, './'),
    };

    /* plugins settings */
    config.plugins.push(new MonacoWebpackPlugin({
      languages:['javascript','json','css','html']
    }));

    return config;
  },
};

