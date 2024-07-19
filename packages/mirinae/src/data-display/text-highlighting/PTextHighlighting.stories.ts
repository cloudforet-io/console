import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTextHighlightingProps } from '@/data-display/text-highlighting/mock';
import { getTextHighlightingArgs, getTextHighlightingArgTypes, getTextHighlightingParameters } from '@/data-display/text-highlighting/story-helper';

import PTextHighlighting from './PTextHighlighting.vue';

type PTextHighlightingPropsAndCustomArgs = ComponentProps<typeof PTextHighlighting>;

const meta : Meta<PTextHighlightingPropsAndCustomArgs> = {
    title: 'Inputs/Text Highlighting',
    component: PTextHighlighting,
    argTypes: {
        ...getTextHighlightingArgTypes(),
    },
    parameters: {
        ...getTextHighlightingParameters(),
    },
    args: {
        ...getTextHighlightingArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextHighlighting>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextHighlighting },
        template: `
            <p-text-highlighting :text="text"
                :term="term"
                :style-type="styleType"
            >
            </p-text-highlighting>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PTextHighlighting },
        template: `
            <p-text-highlighting :text="text"
                :term="term"
            >
            </p-text-highlighting>
        `,
        setup() {
            const { text, term } = getTextHighlightingProps();
            return {
                text,
                term,
            };
        },
    }),
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PTextHighlighting },
        template: `
            <div>
                <p class="text-lg my-4">primary</p>
                <p-text-highlighting :text="text"
                    :term="term"
                    style-type="primary"
                >
                </p-text-highlighting>
                <p class="text-lg my-4">secondary</p>
                <p-text-highlighting :text="text"
                                    :term="term"
                                    style-type="secondary"
                >
                </p-text-highlighting>
            </div>
        `,
        setup() {
            const { text, term } = getTextHighlightingProps();
            return {
                text,
                term,
            };
        },
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PTextHighlighting },
        template: `
            <div>
                <p class="text-lg my-4">default slot</p>
                <p-text-highlighting :text="text"
                    :term="term"
                >
                    <template #default="{text, matched}">
                        <span class="text-blue" :class="{'!text-black': matched, '!font-bold': matched}">{{text}}</span>
                    </template>
                </p-text-highlighting>
            </div>
        `,
        setup() {
            const { text, term } = getTextHighlightingProps();
            return {
                text,
                term,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
