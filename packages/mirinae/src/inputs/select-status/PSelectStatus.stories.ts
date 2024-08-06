import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';


import { getAllAvailableIcons } from '@/foundation/icons/story-helper';
import { useProxyValue } from '@/hooks';
import { getSelectStatusParameters, getSelectStatusArgs, getSelectStatusArgTypes } from '@/inputs/select-status/story-helper';

import PSelectStatus from './PSelectStatus.vue';

type PSelectStatusPropsAndCustomArgs = ComponentProps<typeof PSelectStatus>;

const meta : Meta<PSelectStatusPropsAndCustomArgs> = {
    title: 'Inputs/Select Status',
    component: PSelectStatus,
    argTypes: {
        ...getSelectStatusArgTypes(),
    },
    parameters: {
        ...getSelectStatusParameters(),
    },
    args: {
        ...getSelectStatusArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSelectStatus>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSelectStatus },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-select-status
                    :value="value"
                    v-model="proxySelected"
                    :predicate="predicate"
                    :multi-selectable="multiSelectable"
                    :disable-check-icon="disableCheckIcon"
                    :icon="icon"
                    :icon-color="iconColor"
                    @change="onChange"
                >
                    <span v-if="defaultSlot" v-html="defaultSlot" />
                </p-select-status>
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
        components: { PSelectStatus },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-status v-for="(value, idx) in values" :key="idx"
                    :value="value"
                    v-model="selected"
                    class="mr-4"
                >
                    {{value}}
                </p-select-status>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const values = range(8).map(() => faker.random.word());
            const state = reactive({
                selected: values[0],
                values,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const WithIcon: Story = {
    render: () => ({
        components: { PSelectStatus },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-status v-for="(value, idx) in values" :key="idx"
                    :value="value"
                    :icon="icons[idx]"
                    v-model="selected"
                    class="mr-4"
                >
                    {{value}}
                </p-select-status>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const values = range(8).map(() => faker.random.word());
            const state = reactive({
                selected: values[0],
                values,
                icons: getAllAvailableIcons(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const MultiSelect: Story = {
    render: () => ({
        components: { PSelectStatus },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-status v-for="(value, idx) in values" :key="idx"
                    :value="value"
                    multi-selectable
                    v-model="selected"
                    class="mr-4"
                >
                    {{value}}
                </p-select-status>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const values = range(8).map(() => faker.random.word());
            const state = reactive({
                selected: [values[0], values[1]],
                values,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const WithoutCheckIcon: Story = {
    render: () => ({
        components: { PSelectStatus },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-status v-for="(value, idx) in values" :key="idx"
                    :value="value"
                    v-model="selected"
                    :disable-check-icon="true"
                    class="mr-4"
                >
                    {{value}}
                </p-select-status>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const values = range(8).map(() => faker.random.word());
            const state = reactive({
                selected: [values[0]],
                values,
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
