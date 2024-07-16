import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getSpinnerDefaultArgs, getSpinnerArgTypes } from '@/feedbacks/loading/spinner/story-helper';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';

import PSpinner from './PSpinner.vue';

type PSpinnerPropsAndCustomArgs = ComponentProps<typeof PSpinner>;

const meta : Meta<PSpinnerPropsAndCustomArgs> = {
    title: 'Feedbacks/Loading/Spinner',
    component: PSpinner,
    argTypes: {
        ...getSpinnerArgTypes(),
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=5687%3A372907&viewport=-33728%2C-44113%2C1.65',
        },
    },
    args: {
        ...getSpinnerDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSpinner>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSpinner },
        template: `
            <p-spinner
                :size="size"
                :style-type="styleType"
            ></p-spinner>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PSpinner },
        template: `
            <p-spinner />
        `,
    }),
};

export const StyleType: Story = {
    render: () => ({
        components: { PSpinner },
        template: `
            <div class="flex items-center">
                <span class="mr-4"><p-spinner style-type="gray"/></span>
                <span class="bg-black"><p-spinner style-type="white"/></span>
            </div>
        `,
    }),
};

export const Size: Story = {
    render: () => ({
        components: { PSpinner },
        template: `
            <div class="flex items-center">
                <p-spinner v-for="size in sizes" class="mr-4" :size="size" />
            </div>
        `,
        setup() {
            const state = reactive({
                sizes: Object.values(SPINNER_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
