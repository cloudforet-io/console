import type { StorybookConfig } from "@storybook/vue-vite";
import { mainConfig } from "storybook-config-custom";

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-vite)

const config: StorybookConfig = {
  ...mainConfig,
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // 👇 Retrieve the current environment from the configType argument
  refs: (config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        mirinae: {
          title: 'Mirinae Storybook (development mode)',
          url: 'http://localhost:6006',
        },
        web: {
          title: 'Web Component (development mode)',
          url: 'http://localhost:6007',
        },
      };
    }
    return {
      mirinae: {
        title: 'Mirinae Component',
        url: 'https://storybook.developer.spaceone.dev',
      },
      web: {
        title: 'Web Component',
        url: 'https://spaceone-web-storybook.vercel.app',
      },
    };
  },
};

export default config;
