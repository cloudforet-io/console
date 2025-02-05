import type { StorybookConfig } from "@storybook/vue-vite";
import { mainConfig } from "storybook-config-custom";

/** @type { import('@storybook/vue-vite').StorybookConfig } */
const config: StorybookConfig = {
  ...mainConfig,
  stories: [
    '../../../packages/mirinae/src/**/*.mdx',
    '../../../packages/mirinae/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
};

export default config;
