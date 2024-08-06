import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';


import { useProxyValue } from '@/hooks';
import { SELECT_BUTTON_LAYOUT_TYPE, SELECT_BUTTON_SIZE, SELECT_BUTTON_STYLE_TYPE } from '@/inputs/select-button/config';
import { getSelectButtonParameters, getSelectButtonArgs, getSelectButtonArgTypes } from '@/inputs/select-button/story-helper';

import PSelectButton from './PSelectButton.vue';

type PSelectButtonPropsAndCustomArgs = ComponentProps<typeof PSelectButton>;

const meta : Meta<PSelectButtonPropsAndCustomArgs> = {
    title: 'Inputs/Select Button',
    component: PSelectButton,
    argTypes: {
        ...getSelectButtonArgTypes(),
    },
    parameters: {
        ...getSelectButtonParameters(),
    },
    args: {
        ...getSelectButtonArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSelectButton>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSelectButton },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-select-button :value="value"
                v-model="proxySelected"
                :predicate="predicate"
                :multi-selectable="multiSelectable"
                :icon-name="iconName"
                :style-type="styleType"
                :size="size"
                :disabled="disabled"
                :layout="layout"
                @change="onChange"
            >
                <span v-if="defaultSlot" v-html="defaultSlot" />
            </p-select-button>
        </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySelected: useProxyValue('selected', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PSelectButton },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-button v-for="value in values" :key="value"
                    :value="value"
                    v-model="selected"
                    class="mr-2"
                >
                    {{value}}
                </p-select-button>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: undefined,
                values: range(8),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const MultiSelect: Story = {
    render: () => ({
        components: { PSelectButton },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-button v-for="value in values" :key="value"
                    multi-selectable
                    :value="value"
                    v-model="selected"
                    class="mr-2"
                >
                    {{value}}
                </p-select-button>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: [],
                values: range(8),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleTypesAndSizes: Story = {
    render: () => ({
        components: { PSelectButton },
        template: `
            <div class="w-full overflow p-8">
                <div v-for="size in sizes" :key="size" class="flex flex-wrap mb-8">
                    <h2 class="mb-4 text-xl font-bold">Size: {{size}}</h2>
                    <div v-for="styleType in styleTypes" :key="styleType" class="w-full flex flex-wrap mb-4">
                        <h2 class="mr-2">{{styleType}}</h2>
                        <p-select-button v-for="value in values" :key="value"
                                :size="size"
                                :style-type="styleType"
                                :value="value"
                                v-model="selected"
                                class="mr-2"
                        >
                            {{value}}
                        </p-select-button>
                    </div>
                </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: undefined,
                values: range(8),
                sizes: Object.values(SELECT_BUTTON_SIZE),
                styleTypes: Object.values(SELECT_BUTTON_STYLE_TYPE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Layout: Story = {
    render: () => ({
        components: { PSelectButton },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-button v-for="item in items" :key="item.value"
                    :value="item.value"
                    :layout="SELECT_BUTTON_LAYOUT_TYPE.ICON_ONLY"
                    :icon-name="item.iconName"
                    :style-type="SELECT_BUTTON_STYLE_TYPE.gray"
                    :disabled="item.disabled"
                    v-model="selected"
                    class="mr-2"
                >
                    {{item}}
                </p-select-button>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: 1,
                items: [
                    { value: 0, iconName: 'ic_chart-line' },
                    { value: 1, iconName: 'ic_chart-line' },
                    { value: 2, iconName: 'ic_chart-line' },
                    { value: 3, iconName: 'ic_chart-line', disabled: true },
                ],
            });
            return {
                ...toRefs(state),
                SELECT_BUTTON_LAYOUT_TYPE,
                SELECT_BUTTON_STYLE_TYPE,
            };
        },
    }),
};

export const Advanced: Story = {
    render: () => ({
        components: { PSelectButton },
        template: `
            <div class="w-full overflow p-8 grid gap-4 grid-cols-3">
                <p-select-button v-for="value in values" :key="value.key"
                    v-model="selected"
                    :value="value"
                    :predicate="predicate"
                    class="mb-4"
                >
                    {{value.name}}
                </p-select-button>
            </div>
        `,
        setup() {
            const state = reactive({
                selected: undefined,
                values: [
                    { key: 'hello', name: 'Hello' },
                    { key: 'world', name: 'World!' },
                    { key: 'spaceone', name: 'SpaceONE' },
                ],
            });
            const predicate = (value, current) => current && value.key === current.key;
            return {
                ...toRefs(state),
                predicate,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
