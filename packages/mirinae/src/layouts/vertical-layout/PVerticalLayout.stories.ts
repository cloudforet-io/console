import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getVerticalLayoutArgTypes, getVerticalLayoutArgs, getVerticalLayoutParameters } from '@/layouts/vertical-layout/story-helper';

import PVerticalLayout from './PVerticalLayout.vue';

type PVerticalLayoutPropsAndCustomArgs = ComponentProps<typeof PVerticalLayout>;

const meta : Meta<PVerticalLayoutPropsAndCustomArgs> = {
    title: 'Layouts/Vertical Layout',
    component: PVerticalLayout,
    argTypes: {
        ...getVerticalLayoutArgTypes(),
    },
    parameters: {
        ...getVerticalLayoutParameters(),
    },
    args: {
        ...getVerticalLayoutArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PVerticalLayout>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: {
            PVerticalLayout,
        },
        template: `
            <div style="width: 100vw; height: 10rem; border: 1px solid gray;">
                <p-vertical-layout>
                    <template #sidebar>
                        Left Layout
                    </template>
                    <template #default>
                        Right Layout
                    </template>
                </p-vertical-layout>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
