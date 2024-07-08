import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  console.log(dirname(require.resolve(join(value, "package.json"))))

  return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import('@storybook/vue-webpack5').StorybookConfig } */
const config = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-webpack5-compiler-babel"
  ],
  framework: "@storybook/vue-webpack5",
  core: {
    builder: '@storybook/builder-webpack5',
  },
  docs: {
    autodocs: "tag",
  }
};
export default config;
