import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTextButtonArgs, getTextButtonArgTypes, getTextButtonParameters } from '@/inputs/buttons/text-button/story-helper';
import { TEXT_BUTTON_SIZE } from '@/inputs/buttons/text-button/type';

import PTextButton from './PTextButton.vue';

type PTextButtonPropsAndCustomArgs = ComponentProps<typeof PTextButton>;

const meta : Meta<PTextButtonPropsAndCustomArgs> = {
    title: 'Inputs/Buttons/Text Button',
    component: PTextButton,
    argTypes: {
        ...getTextButtonArgTypes(),
    },
    parameters: {
        ...getTextButtonParameters(),
    },
    args: {
        ...getTextButtonArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextButton>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:150px;">
                <p-text-button
                    @click="handleClick"
                    :styleType="styleType"
                    :size="size"
                    :disabled="disabled"
                    :loading="loading"
                    :icon-left="iconLeft"
                    :icon-right="iconRight"
                    :readonly="readonly"
                >
                    {{$props.default}}
                </p-text-button>
            </div>
        `,
    }),
};

export const Sizes: Story = {
    render: () => ({
        components: { PTextButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; background-color: white">
                <p-text-button v-for="size in buttonSizes" style-type="default" style="margin-right: 20px" :size="size">
                    {{ size }}
                </p-text-button>
            </div>
        `,
        setup() {
            const state = reactive({
                buttonSizes: Object.values(TEXT_BUTTON_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const WithIcon: Story = {
    render: () => ({
        components: { PTextButton },
        template: `
            <div>
                <div style="display:flex; align-items:center; justify-content:center; background-color: white">
                    <p-text-button v-for="size in buttonSizes" style-type="default" style="margin-right: 20px" :size="size" icon-left="ic_plus_bold">
                        {{ size }}
                    </p-text-button>
                </div>
                <div style="display:flex; align-items:center; justify-content:center; margin-top: 50px; background-color: white">
                    <p-text-button v-for="size in buttonSizes" style-type="default" style="margin-right: 20px" :size="size" icon-right="ic_plus_bold">
                        {{ size }}
                    </p-text-button>
                </div>
            </div>
`,
        setup() {
            const state = reactive({
                buttonSizes: Object.values(TEXT_BUTTON_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PTextButton },
        template: `
            <div style="display: flex; align-items: center; justify-content: center">
                <p-text-button style-type="default">
                    default
                </p-text-button>
                <p-text-button style-type="highlight">
                    highlight
                </p-text-button>
            </div>
        `,
    }),
};

export const Loading: Story = {
    render: () => ({
        components: { PTextButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-text-button :loading="true">
                    button
                </p-text-button>
            </div>
        `,
    }),
};

export const ReadonlyAndDisabled: Story = {
    render: () => ({
        components: { PTextButton },
        template: `
            <div class="flex flex-col">
                <div class="py-4">
                    <p class="mb-3 font-bold">default style type: </p>
                    <div class="flex items-center gap-4">
                        <p-text-button>
                            normal
                        </p-text-button>
                        <p-text-button disabled>
                            disabled
                        </p-text-button>
                        <p-text-button readonly>
                            readonly
                        </p-text-button>
                    </div>
                </div>
                <div class="py-4">
                    <p class="mb-3 font-bold">highlight style type: </p>
                   <div class="flex items-center gap-4">
                       <p-text-button style-type="highlight">
                           normal
                       </p-text-button>
                       <p-text-button disabled style-type="highlight">
                           disabled
                       </p-text-button>
                       <p-text-button readonly style-type="highlight">
                           readonly
                       </p-text-button>
                    </div>
                </div>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
