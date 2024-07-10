import { join, dirname } from "path";

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import('@storybook/vue-vite').StorybookConfig } */
const config = {
  stories: [
    '../../../packages/mirinae/src/yubeom/**/*.mdx',
    '../../../packages/mirinae/src/yubeom/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-storysource")
  ],
  framework: getAbsolutePath("@storybook/vue-vite")
};

export default config;