import { computed } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import highlightStyle from 'highlight.js/scss/atom-one-dark.scss';
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
            const { sanitizedHtml } = useMarkdown({
                value: computed(() => props.value),
                inlineCodeClass: props.inlineCodeClass,
            });
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


export const WithInlineCodeClass: Story = {
    render: () => ({
        template: `<div v-html="sanitizedHtml"></div>
        `,
        setup() {
            const { sanitizedHtml } = useMarkdown({
                value: 'Use `inline code` here.',
                inlineCodeClass: 'my-inline-code',
            });
            return { sanitizedHtml };
        },
    }),
    decorators: [() => ({
        template: `
        <div>
            <story />
            <component is="style" type="text/css">
             code.my-inline-code {
                background-color: lightyellow;
                padding: 2px 4px;
                border-radius: 4px;
                font-family: monospace;
            }
            </component>
        </div>
    `,
    })],
};

export const WithCodeHighlightingDisabled: Story = {
    render: () => ({
        template: `<div>
            <p>With Code Block Highlighting</p>
            <br>
            <div v-html="withHighlight"></div>
            <br>
            <br>
            <p>Without Code Block Highlighting</p>
            <br>
            <div v-html="withoutHighlight"></div>
        </div>`,
        setup() {
            const { sanitizedHtml: withHighlight } = useMarkdown({
                value: '```javascript\nconsole.log("Hello");\n```',
                codeBlockHighlighting: true,
            });
            const { sanitizedHtml: withoutHighlight } = useMarkdown({
                value: '```javascript\nconsole.log("Hello");\n```',
                codeBlockHighlighting: false,
            });
            return { withHighlight, withoutHighlight };
        },
    }),
    decorators: [() => ({
        template: `
        <div>
            <story />
            <component is="style" type="text/css">
             ${highlightStyle}
            </component>
        </div>
    `,
    })],
};

export const Playground: Story = {
    ...Template,
};
