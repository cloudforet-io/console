import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { PROGRESS_BAR_SIZE } from '@/data-display/progress-bar/config';
import PProgressBar from '@/data-display/progress-bar/PProgressBar.vue';
import { getProgressBarDefaultArgs, getProgressBarArgTypes } from '@/data-display/progress-bar/story-helper';

type PProgressBarPropsAndCustomArgs = ComponentProps<typeof PProgressBar>;

const meta : Meta<PProgressBarPropsAndCustomArgs> = {
    title: 'Data Display/Progress Bar',
    component: PProgressBar,
    argTypes: {
        ...getProgressBarArgTypes(),
        // 'item-content': { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=2667%3A173604',
        },
    },
    args: {
        ...getProgressBarDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PProgressBar>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PProgressBar },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:100px;">
                <p-progress-bar
                    :percentage="percentage"
                    :label="label"
                    :size="size"
                    :color="color"
                    :gradient="gradient"
                    :disable-animation="disableAnimation"
                    :height="height"
                    :style="'width: 10rem;'"
                >
                    <template #label>
                        <span v-if="labelSlot" v-html="labelSlot"></span>
                    </template>
                </p-progress-bar>
            </div>
        `,
    }),
};

export const Label: Story = {
    render: () => ({
        components: { PProgressBar },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-progress-bar
                    :percentage="40"
                    label="label"
                    :style="'width: 10rem;'"
                />
            </div>
        `,
    }),
};

export const Size: Story = {
    render: () => ({
        components: { PProgressBar },
        template: `
            <div style="display:flex; flex-direction: column; align-items:center; row-gap: 1.5rem;">
                <p-progress-bar v-for="size in sizes" :key="size" :size="size"
                    :percentage="40"
                    :label="size"
                    :style="'width: 10rem;'"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                sizes: Object.values(PROGRESS_BAR_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Color: Story = {
    render: () => ({
        components: { PProgressBar },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-progress-bar
                    :percentage="40"
                    color="coral"
                    :style="'width: 10rem;'"
                />
            </div>
        `,
    }),
};

export const Gradient: Story = {
    render: () => ({
        components: { PProgressBar },
        template: `
            <div>
                <p-progress-bar
                    :percentage="40"
                    :gradient="{startColor: 'coral', endColor: 'yellow', gradientPoint:90}"
                    :style="'width: 10rem;'"
                />
            </div>
        `,
    }),
};

export const CustomHeight: Story = {
    render: () => ({
        components: { PProgressBar },
        template: `
            <div style="display:flex; flex-direction: column; row-gap: 1.5rem;">
                <p class="font-bold text-lg text-gray-600">Without custom height</p>
                <div style="display:flex; flex-wrap: wrap; gap: 1rem;">
                    <p-progress-bar v-for="size in sizes" :key="size" :size="size"
                        :percentage="40"
                        :label="size"
                        :style="'width: 10rem;'"
                    />
                </div>
                <p class="font-bold text-lg mt-4">With custom height - 1.5rem</p>
                <div style="display:flex; flex-wrap: wrap; gap: 1rem;">
                    <p-progress-bar v-for="size in sizes" :key="size" :size="size"
                        :percentage="40"
                        :label="size"
                        height="1.5rem"
                        :style="'width: 10rem;'"
                    />
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                sizes: Object.values(PROGRESS_BAR_SIZE),
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
