import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

import { getSkeletonDefaultArgs, getSkeletonArgTypes } from './story-helper';

type PSkeletonPropsAndCustomArgs = ComponentProps<typeof PSkeleton>;

const meta : Meta<PSkeletonPropsAndCustomArgs> = {
    title: 'Feedbacks/Loading/Skeleton',
    component: PSkeleton,
    argTypes: {
        ...getSkeletonArgTypes(),
    },
    args: {
        ...getSkeletonDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSkeleton>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSkeleton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:150px;">
                <div style="width: 500px; ">
                    <PSkeleton v-bind="$props">text</PSkeleton>
                </div>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
