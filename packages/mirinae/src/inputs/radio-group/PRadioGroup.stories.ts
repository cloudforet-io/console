import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getRadioGroupArgs, getRadioGroupParameters, getRadioGroupArgTypes } from '@/inputs/radio-group/story-helper';
import PRadio from '@/inputs/radio/PRadio.vue';

import PRadioGroup from './PRadioGroup.vue';

type PRadioGroupPropsAndCustomArgs = ComponentProps<typeof PRadioGroup>;

const meta : Meta<PRadioGroupPropsAndCustomArgs> = {
    title: 'Inputs/Radio Group',
    component: PRadioGroup,
    argTypes: {
        ...getRadioGroupArgTypes(),
    },
    parameters: {
        ...getRadioGroupParameters(),
    },
    args: {
        ...getRadioGroupArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PRadioGroup>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PRadioGroup, PRadio },
        template: `
            <div class="h-full w-full overflow p-8 flex flex-col">
                <p-radio-group :direction="direction">
                    <p-radio v-for="value in values"
                             :key="value"
                             :value="value"
                             v-model="proxySelected"
                    >
                        This is radio for {{value}}
                    </p-radio>
                </p-radio-group>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySelected: useProxyValue('selected', props, emit),
                values: [0, 1, 2, 3],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PRadioGroup, PRadio },
        template: `
            <div>
                <div class="flex flex-col">
                    <p-radio-group>
                        <p-radio v-for="value in values" v-model="selected" :value="value" :key="value">
                            This is radio for {{value}}
                        </p-radio>
                    </p-radio-group>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                selected: undefined,
                values: [0, 1, 2, 3],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Direction: Story = {
    render: () => ({
        components: { PRadioGroup, PRadio },
        template: `
        <div>
            <div class="flex flex-col row-gap-8">
                <div class="flex flex-col row-gap-2">
                    <p>Horizontal (default)</p>
                    <p-radio-group direction="horizontal">
                        <p-radio :key="value" v-for="value in horizontalValues" v-model="horizontalSelected" :value="value">
                            {{value}}
                        </p-radio>
                    </p-radio-group>
                </div>
                <div class="flex flex-col row-gap-2">
                    <p>Vertical</p>
                    <p-radio-group direction="vertical">
                        <p-radio :key="value" v-for="value in verticalValues" v-model="verticalSelected" :value="value">
                            {{value}}
                        </p-radio>
                    </p-radio-group>
                </div>
            </div>
        </div>
    `,
        setup() {
            const state = reactive({
                horizontalValues: [true, false],
                horizontalSelected: true,
                verticalValues: [true, false],
                verticalSelected: true,
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
