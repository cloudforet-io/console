import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';


import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import { getCopyButtonArgs, getCopyButtonArgTypes, getCopyButtonParameters } from '@/inputs/buttons/copy-button/story-helper';
import { SIZE } from '@/inputs/buttons/copy-button/type';
import PTextarea from '@/inputs/textarea/PTextarea.vue';
import { copyAnyData } from '@/utils/helpers';

type PCopyButtonPropsAndCustomArgs = ComponentProps<typeof PCopyButton>;

const meta : Meta<PCopyButtonPropsAndCustomArgs> = {
    title: 'Inputs/Buttons/Copy Button',
    component: PCopyButton,
    argTypes: {
        ...getCopyButtonArgTypes(),
    },
    parameters: {
        ...getCopyButtonParameters(),
    },
    args: {
        ...getCopyButtonArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PCopyButton>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PCopyButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:150px;">
                <p-copy-button
                    :value="value"
                    :size="size"
                    :auto-hide-icon="autoHideIcon"
                    :copy-manually="copyManually"
                    @copy="onCopy"
                    @copied="onCopied"
                >
                    {{ defaultSlot }}
                </p-copy-button>
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PCopyButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:150px;">
                <p-copy-button>
                    Hello, World!
                </p-copy-button>
            </div>
        `,
    }),
};

export const Size: Story = {
    render: () => ({
        components: { PCopyButton },
        template: `
            <div style="display:flex; align-items:center; height:150px; column-gap: 10px;">
                <p-copy-button v-for="size in sizes" :size="size" >
                    Hello, World!
                </p-copy-button>
            </div>
        `,
        setup() {
            const state = reactive({
                sizes: Object.values(SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const AutoHideIcon: Story = {
    render: () => ({
        components: { PCopyButton },
        template: `
            <div style="height:150px;">
                <p class="mb-4 text-xl">Has text to copy:
                    <p-copy-button auto-hide-icon>
                        Hello, World!
                    </p-copy-button>
                </p>
                <p class="my-4 text-xl">Has NO text to copy:
                    <p-copy-button auto-hide-icon></p-copy-button>
                </p>
            </div>
        `,
    }),
};

export const CopyManually: Story = {
    render: () => ({
        components: { PCopyButton, PTextarea },
        template: `
            <div style="height:150px;">
                <p class="mb-4 text-xl">Check copied text.</p>
                <p-textarea class="mb-4" />
                <p-copy-button copy-manually @copy="onCopy">Hello, World!</p-copy-button>
            </div>
        `,
        setup() {
            return {
                onCopy() {
                    copyAnyData('This is copied text!');
                },
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};
