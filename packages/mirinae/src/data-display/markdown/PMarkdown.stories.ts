import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import mock from '@/data-display/markdown/mock';
import { getMarkdownArgTypes, getMarkdownArgs, getMarkdownParameters } from '@/data-display/markdown/story-helper';

import PMarkdown from './PMarkdown.vue';

type PMarkdownPropsAndCustomArgs = ComponentProps<typeof PMarkdown>;

const meta : Meta<PMarkdownPropsAndCustomArgs> = {
    title: 'Data Display/Markdown',
    component: PMarkdown,
    argTypes: {
        ...getMarkdownArgTypes(),
    },
    parameters: {
        ...getMarkdownParameters(),
    },
    args: {
        ...getMarkdownArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PMarkdown>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PMarkdown },
        template: `
            <p-markdown :markdown="markdown" :language="language" :data="data" :remove-spacing="removeSpacing" >
            </p-markdown>
        `,
    }),
};

export const StringMarkdown: Story = {
    ...Template,
    args: {
        markdown: mock.markdown.en,
    },
};

export const ObjectMarkdown: Story = {
    ...Template,
    args: {
        markdown: mock.markdown,
        language: 'ko',
    },
};

export const DataCombining: Story = {
    ...Template,
    args: {
        markdown: mock.markdownWithData,
        language: 'ko',
    },
};

export const Playground: Story = {
    ...Template,
};
