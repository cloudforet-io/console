import { computed, reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getCheckboxArgs, getCheckboxParameters, getCheckboxArgTypes } from '@/inputs/checkbox/story-helper';

import PCheckbox from './PCheckbox.vue';

type PCheckboxPropsAndCustomArgs = ComponentProps<typeof PCheckbox>;

const meta : Meta<PCheckboxPropsAndCustomArgs> = {
    title: 'Inputs/Checkbox',
    component: PCheckbox,
    argTypes: {
        ...getCheckboxArgTypes(),
    },
    parameters: {
        ...getCheckboxParameters(),
    },
    args: {
        ...getCheckboxArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PCheckbox>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PCheckbox },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-checkbox :value="value"
                            v-model="proxySelected"
                            :disabled="disabled"
                            :predicate="predicate"
                            :invalid="invalid"
                            @change="onChange"
                >
                    <span v-html="defaultSlot" />
                    <template #icon>
                        <span v-if="iconSlot" v-html="iconSlot"/>
                    </template>
                </p-checkbox>
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
        components: { PCheckbox },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-checkbox v-for="value in values" v-model="selected" :value="value" :key="value">
                        This is checkbox for {{value}}
                    </p-checkbox>
                </div>
                selected : {{selected}}
            </div>
        `,
        setup() {
            const state = reactive({
                selected: [],
                values: [0, 1, 2, 3],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const SimpleBoolean: Story = {
    render: () => ({
        components: { PCheckbox },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-checkbox v-model="selected">
                        simple boolean checkbox
                    </p-checkbox>
                </div>
                selected : {{selected}}
            </div>
        `,
        setup() {
            const state = reactive({
                selected: false,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Disabled: Story = {
    render: () => ({
        components: { PCheckbox },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-checkbox v-model="notSelected" disabled>
                        you can't select disabled checkbox.
                    </p-checkbox>
                    <p-checkbox v-model="selected" disabled>
                        checked disabled
                    </p-checkbox>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                notSelected: false,
                selected: true,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Invalid: Story = {
    render: () => ({
        components: { PCheckbox },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p class="mb-4">At least, one item must be selected.</p>
                    <p-checkbox v-for="value in values" :key="value"
                                v-model="selected"
                                :value="value"
                                :invalid="selected.length === 0"
        >
                        {{value}}
                    </p-checkbox>
                </div>
                selected : {{selected}}
            </div>
        `,
        setup() {
            const state = reactive({
                selected: [],
                values: [0, 1, 2, 3],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Indeterminate: Story = {
    render: () => ({
        components: { PCheckbox },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-checkbox :value="true"
                                :indeterminate="isIndeterminate"
                                :selected="isAllSelected"
                                @change="handleCheckAll"
                    >
                        You can confirm that all items are selected.
                    </p-checkbox>
                    <p-checkbox v-for="value in values" :key="value"
                                v-model="selected"
                                :value="value"
                    >
                        {{value}}
                    </p-checkbox>
                </div>
                selected : {{selected}}
            </div>
        `,
        setup() {
            const state = reactive({
                isAllSelected: computed(() => state.selected.length === state.values.length),
                selected: [],
                values: [0, 1, 2, 3],
                isIndeterminate: computed(() => state.selected.length > 0 && state.selected.length < state.values.length),
            });
            const handleCheckAll = (val) => {
                state.selected = val ? state.values : [];
            };
            return {
                handleCheckAll,
                ...toRefs(state),
            };
        },
    }),
};

export const Advanced: Story = {
    render: () => ({
        components: { PCheckbox },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-checkbox v-for="value in values" :key="value.key"
                                v-model="selected"
                                :value="value"
                                :predicate="predicate"
        >
                        {{value.name}}
                    </p-checkbox>
                </div>
                selected : <pre>{{selected}}</pre>
            </div>
        `,
        setup() {
            const state = reactive({
                selected: [],
                values: [
                    { key: 'hello', name: 'Hello' },
                    { key: 'world', name: 'World!' },
                    { key: 'spaceone', name: 'SpaceONE' },
                ],
            });
            const predicate = (value, current) => value.key === current.key;
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
