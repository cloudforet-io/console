import { join, dirname } from "path";
import type { StorybookConfig } from "@storybook/vue-vite";

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import('@storybook/vue-vite').StorybookConfig } */
const config: StorybookConfig = {
  staticDirs: ['../public'],
  stories: [
    '../../../packages/mirinae/src/data-display/board/**/*.mdx',
    '../../../packages/mirinae/src/data-display/badge/**/*.mdx',
    '../../../packages/mirinae/src/data-display/board-item/**/*.mdx',
    '../../../packages/mirinae/src/data-display/cards/**/*.mdx',
    '../../../packages/mirinae/src/data-display/collapsible/collapsible-list/**/*.mdx',
    '../../../packages/mirinae/src/data-display/collapsible/collapsible-panel/**/*.mdx',
    '../../../packages/mirinae/src/data-display/collapsible/collapsible-toggle/**/*.mdx',
    '../../../packages/mirinae/src/data-display/dynamic/dynamic-field/**/*.mdx',
    '../../../packages/mirinae/src/data-display/board/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/mirinae/src/data-display/badge/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/mirinae/src/data-display/board-item/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/mirinae/src/data-display/cards/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/mirinae/src/data-display/collapsible/collapsible-list/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/mirinae/src/data-display/collapsible/collapsible-panel/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/mirinae/src/data-display/collapsible/collapsible-toggle/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/mirinae/src/data-display/dynamic/dynamic-field/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-storysource"),
    getAbsolutePath("@storybook/addon-a11y")
  ],
  framework: {
    name: getAbsolutePath("@storybook/vue-vite") as "@storybook/vue-vite",
    options: {},
  },
  previewHead: (head) => {
    return `
      ${head}
      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
      <link rel='shortcut icon' type='image/x-icon' href="<%= BASE_URL %>favicon.ico">
      <link rel='manifest' type='image/x-icon' href="<%= BASE_URL %>manifest.json">
      <link rel="apple-touch-icon" href="<%= BASE_URL %>images/icons/icon-192x192.png">
      `
  },
  previewBody: (body) => {
    return `
      ${body}
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
      </style>
    `
  }
};

export default config;