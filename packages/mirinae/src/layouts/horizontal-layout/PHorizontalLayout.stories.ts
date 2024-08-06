import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getHorizontalLayoutArgTypes, getHorizontalLayoutParameters, getHorizontalLayoutArgs } from '@/layouts/horizontal-layout/story-helper';

import PHorizontalLayout from './PHorizontalLayout.vue';

type PHorizontalLayoutPropsAndCustomArgs = ComponentProps<typeof PHorizontalLayout>;

const meta : Meta<PHorizontalLayoutPropsAndCustomArgs> = {
    title: 'Layouts/Horizontal Layout',
    component: PHorizontalLayout,
    argTypes: {
        ...getHorizontalLayoutArgTypes(),
    },
    parameters: {
        ...getHorizontalLayoutParameters(),
    },
    args: {
        ...getHorizontalLayoutArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PHorizontalLayout>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: {
            PHorizontalLayout,
        },
        template: `
            <p-horizontal-layout
                :height="height"
                :min-height="minHeight"
                :max-height="maxHeight"
                class="h-50 w-50"
            >
                <template #container="{ height }">
                    <div :style="{height: height + 'px'}"
                         class="flex justify-center items-center bg-primary2 text-white font-bold text-lg"
                    >
                        <span>This is contents</span>
                    </div>
                </template>
            </p-horizontal-layout>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: {
            PHorizontalLayout,
        },
        template: `
            <p-horizontal-layout class="h-50 w-50">
                <template #container="{ height }">
                    <div :style="{height: height + 'px'}"
                         class="flex justify-center items-center bg-primary2 text-white font-bold text-lg"
                    >
                        <span>This is contents</span>
                    </div>
                </template>
            </p-horizontal-layout>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
