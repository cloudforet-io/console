 // { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
 const path = require('path');
 const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

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
    '@storybook/addon-docs',
  ],
  webpack:  (config) => {

    /* Babel settings */
    config.module.rules.push({
      test : /\.js$/,
      exclude : /node_modules/,
      use:{
        loader: "babel-loader",
        options: {
          presets: [
            '@vue/cli-plugin-babel/preset',
          ],
        }
      }
    });

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
        use: ['style-loader', 'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              data: `@import "~@/styles/_variables.scss";`
            }
          },
        ],
        include: path.resolve(__dirname, '../'),
        exclude:[path.resolve(__dirname, '..', 'node_modules/monaco-editor')]

      }
    );

    /* alis settings */
    config.resolve.alias = {
      node_modules: path.resolve('./node_modules'),
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

