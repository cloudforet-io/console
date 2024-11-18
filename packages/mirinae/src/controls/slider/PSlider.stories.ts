import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';


import {
    getSliderArgs, getSliderArgTypes, getSliderParameters,
} from '@/controls/slider/story-helper';

import PSlider from './PSlider.vue';


type PSliderPropsAndCustomArgs = ComponentProps<typeof PSlider>;

const meta : Meta<PSliderPropsAndCustomArgs> = {
    title: 'Controls/Slider',
    component: PSlider,
    argTypes: {
        ...getSliderArgTypes(),
    },
    parameters: {
        ...getSliderParameters(),
    },
    args: {
        ...getSliderArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSlider>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSlider },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-slider :value.sync="val"
                :min="min"
                :max="max"
                :showInput="showInput"
            />
        </div>
        `,
        setup() {
            const state = reactive({
                val: 50,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSlider },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-slider :value.sync="val" />
            </div>
        `,
        setup() {
            const state = reactive({
                val: 50,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Step: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSlider },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-slider :value.sync="val" :step="10" :min="100" :max="200" />
            </div>
        `,
        setup() {
            const state = reactive({
                val: 120,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};


export const ShowValue: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSlider },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-slider class="mb-10" :value.sync="val" />

                <p-slider :value.sync="val_sub" :show-value="false" />
            </div>
        `,
        setup() {
            const state = reactive({
                val: 50,
                val_sub: 50,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const ShowInput: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSlider },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-slider :value.sync="val" show-input />
            </div>
        `,
        setup() {
            const state = reactive({
                val: 50,
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
