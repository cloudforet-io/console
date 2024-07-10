import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
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
  framework: {
    name: getAbsolutePath("@storybook/vue-vite"),
    options: {},
  }
};
export default config;
