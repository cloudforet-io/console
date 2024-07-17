import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getCheckboxGroupArgs, getCheckboxGroupParameters, getCheckboxGroupArgTypes } from '@/inputs/checkbox-group/story-helper';
import PCheckbox from '@/inputs/checkbox/PCheckbox.vue';

import PCheckboxGroup from './PCheckboxGroup.vue';

type PCheckboxGroupPropsAndCustomArgs = ComponentProps<typeof PCheckboxGroup>;

const meta : Meta<PCheckboxGroupPropsAndCustomArgs> = {
    title: 'Inputs/Checkbox Group',
    component: PCheckboxGroup,
    argTypes: {
        ...getCheckboxGroupArgTypes(),
    },
    parameters: {
        ...getCheckboxGroupParameters(),
    },
    args: {
        ...getCheckboxGroupArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PCheckboxGroup>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PCheckboxGroup, PCheckbox },
        template: `
            <div class="h-full w-full overflow p-8 flex flex-col">
                <p-checkbox-group :direction="direction">
                    <p-checkbox v-for="value in values"
                             :key="value"
                             :value="value"
                             v-model="proxySelected"
                    >
                        This is checkbox for {{value}}
                    </p-checkbox>
                </p-checkbox-group>
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
        components: { PCheckboxGroup, PCheckbox },
        template: `
            <div>
                <div class="flex flex-col">
                    <p-checkbox-group>
                        <p-checkbox v-for="value in values" v-model="selected" :value="value" :key="value">
                            This is checkbox for {{value}}
                        </p-checkbox>
                    </p-checkbox-group>
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
        components: { PCheckboxGroup, PCheckbox },
        template: `
        <div>
            <div class="flex flex-col row-gap-8">
                <div class="flex flex-col row-gap-2">
                    <p>Horizontal (default)</p>
                    <p-checkbox-group direction="horizontal">
                        <p-checkbox :key="value" v-for="value in horizontalValues" v-model="horizontalSelected" :value="value">
                            This is checkbox for {{value}}
                        </p-checkbox>
                    </p-checkbox-group>
                </div>
                <div class="flex flex-col row-gap-2">
                    <p>Vertical</p>
                    <p-checkbox-group direction="vertical">
                        <p-checkbox :key="value" v-for="value in verticalValues" v-model="verticalSelected" :value="value">
                            This is checkbox for {{value}}
                        </p-checkbox>
                    </p-checkbox-group>
                </div>
            </div>
        </div>
    `,
        setup() {
            const state = reactive({
                horizontalValues: [0, 1, 2],
                horizontalSelected: [],
                verticalValues: [0, 1, 2],
                verticalSelected: [],
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
