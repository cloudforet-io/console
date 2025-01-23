// import { dirname, join } from 'path';
import { create } from '@storybook/theming/create';
import { addons } from '@storybook/manager-api';

// function getAbsolutePath(value) {
//     return dirname(require.resolve(join(value, 'package.json')));
// }
export const mainConfig = {
    staticDirs: ['../public'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-designs',
        '@storybook/addon-storysource',
        '@storybook/addon-a11y',
        '@storybook/addon-mdx-gfm',
    ],
    framework: {
        name: '@storybook/vue-vite',
        options: {},
    },
    previewHead: (head) => `
      ${head}
      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
      <link rel='shortcut icon' type='image/x-icon' href="<%= BASE_URL %>favicon.ico">
      <link rel='manifest' type='image/x-icon' href="<%= BASE_URL %>manifest.json">
      <link rel="apple-touch-icon" href="<%= BASE_URL %>images/icons/icon-192x192.png">
      <style>
        blockquote {
            background-color: #D9E8F2;
            border-radius: 4px;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
        }  
      </style>
      `,
    previewBody: (body) => `
      <style>
        .sb-show-main.sb-main-centered #storybook-root {
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
        }

        .docs-story div[scale="1"] {
            transform: none;
            width: 100%;
        }
      </style>
      ${body}
    `,
};

export const createTheme = (themeVars) => create(themeVars);

export const setConfig = (config) => {
    addons.setConfig({
        ...config,
        theme: createTheme(config.theme),
    });
};
