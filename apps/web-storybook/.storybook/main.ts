import { join, dirname } from "path";
import type { StorybookConfig } from "@storybook/vue-vite";
import { mainConfig } from "storybook-config-custom";

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

/** @type { import('@storybook/vue-vite').StorybookConfig } */
const config: StorybookConfig = {
  ...mainConfig,
  stories: [
    '../../web/src/common/**/*.mdx',
    '../../web/src/common/**/*.stories.@(js|jsx|ts|tsx)',
  ],
};

export default config;
