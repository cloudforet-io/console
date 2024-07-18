import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getRadioArgs, getRadioParameters, getRadioArgTypes } from '@/inputs/radio/story-helper';

import PRadio from './PRadio.vue';

type PRadioPropsAndCustomArgs = ComponentProps<typeof PRadio>;

const meta : Meta<PRadioPropsAndCustomArgs> = {
    title: 'Inputs/Radio',
    component: PRadio,
    argTypes: {
        ...getRadioArgTypes(),
    },
    parameters: {
        ...getRadioParameters(),
    },
    args: {
        ...getRadioArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PRadio>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PRadio },
        template: `
            <div class="h-full w-full overflow p-8 flex flex-col">
                <p-radio v-for="value in values"
                         :key="value"
                         :value="value"
                         v-model="proxySelected"
                         :disabled="disabled"
                         :predicate="predicate"
                         :invalid="invalid"
                         :readonly="readonly"
                         @change="onChange"
                >
                    <span v-html="defaultSlot" />
                    <template #radio-left>
                        <span v-if="radioLeftSlot" v-html="radioLeftSlot"/>
                    </template>
                    <template #radio-icon>
                        <span v-if="radioIconSlot" v-html="radioIconSlot"/>
                    </template>
                </p-radio>
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
        components: { PRadio },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-radio v-for="value in values" v-model="selected" :value="value" :key="value">
                        This is radio for {{value}}
                    </p-radio>
                </div>
                selected : {{selected}}
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

export const SimpleBoolean: Story = {
    render: () => ({
        components: { PRadio },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-radio v-model="selected" :value="true">
                        true
                    </p-radio>
                    <p-radio v-model="selected" :value="false">
                        false
                    </p-radio>
                </div>
                selected : {{selected}}
            </div>
        `,
        setup() {
            const state = reactive({
                selected: true,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Disabled: Story = {
    render: () => ({
        components: { PRadio },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-radio v-model="selected" disabled>
                        (not selected) you can't select disabled radio.
                    </p-radio>
                    <p-radio :selected="true" disabled>
                        (selected) selected and disabled radio. you can't select disabled radio.
                    </p-radio>
                </div>
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

export const Readonly: Story = {
    render: () => ({
        components: { PRadio },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-radio v-model="selected" readonly>
                        (not selected) you can't select readonly radio.
                    </p-radio>
                    <p-radio :selected="true" readonly>
                        (selected) selected readonly radio shows checked icon but you can't select readonly radio.
                    </p-radio>
                </div>
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

export const Invalid: Story = {
    render: () => ({
        components: { PRadio },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p class="mb-4">One item must be selected.</p>
                    <p-radio v-for="value in values" :key="value"
                                v-model="selected"
                                :value="value"
                                :invalid="selected.length === 0"
        >
                        {{value}}
                    </p-radio>
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

export const Advanced: Story = {
    render: () => ({
        components: { PRadio },
        template: `
            <div>
                <div class="flex flex-col mb-8">
                    <p-radio v-for="value in values" :key="value.key"
                                v-model="selected"
                                :value="value"
                                :predicate="predicate"
        >
                        {{value.name}}
                    </p-radio>
                </div>
                selected : <pre>{{selected}}</pre>
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
