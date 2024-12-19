import { computed } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getUseMarkdownArgs, getUseMarkdownArgTypes } from './story-helper';
import type { UseMarkdownOptions } from './use-markdown';
import { useMarkdown } from './use-markdown';

type UseMarkdownPropsAndCustomArgs = ComponentProps<UseMarkdownOptions>;

const meta: Meta<UseMarkdownPropsAndCustomArgs> = {
    title: 'Hooks/useMarkdown',
    argTypes: {
        ...getUseMarkdownArgTypes(),
    },
    args: {
        ...getUseMarkdownArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        template: `
            <div v-html="sanitizedHtml"></div>
        `,
        setup(props) {
            const { sanitizedHtml } = useMarkdown({ value: computed(() => props.value) });
            return { sanitizedHtml };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        template: `
            <div v-html="sanitizedHtml"></div>
        `,
        setup() {
            const { sanitizedHtml } = useMarkdown({ value: '# Hello, Markdown!' });
            return { sanitizedHtml };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
