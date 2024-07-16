import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';
import PDefinitionTable from '@/data-display/tables/definition-table/PDefinitionTable.vue';
import { getDefinitionTableDefaultArgs, getDefinitionTableArgTypes } from '@/data-display/tables/definition-table/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';

type PDefinitionTablePropsAndCustomArgs = ComponentProps<typeof PDefinitionTable>;

const meta : Meta<PDefinitionTablePropsAndCustomArgs> = {
    title: 'Data Display/Tables/Definition Table',
    component: PDefinitionTable,
    argTypes: {
        ...getDefinitionTableArgTypes(),
        /* eslint-disable no-template-curly-in-string */
        '`data-${item.name}`': { table: { disable: true } },
        /* eslint-disable no-template-curly-in-string */
        '`data-${idx}`': { table: { disable: true } },
        key: { table: { disable: true } },
        extra: { table: { disable: true } },
        'no-data': { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5373%3A6989',
        },
    },
    args: {
        ...getDefinitionTableDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDefinitionTable>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDefinitionTable },
        template: `
            <p-definition-table
                :fields="fields"
                :data="data"
                :loading="loading"
                :skeleton-rows="skeletonRows"
                :disable-copy="disableCopy"
                :style-type="styleType"
                :block="block"
                :custom-key-width="customKeyWidth"
            />
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PDefinitionTable },
        template: `
            <p-definition-table
                :fields="fields"
                :data="data"
                :loading="loading"
            />
        `,
        setup() {
            const state = reactive({
                fields: [
                    { label: 'Id', name: 'collector_id' },
                    { label: 'Name', name: 'name' },
                    { label: 'Provider', name: 'provider' },
                    { label: 'Plugin', name: 'plugin_info' },
                ],
                data: {},
                loading: true,
            });
            setTimeout(() => {
                state.data = {
                    collector_id: 'collector-abcdefg',
                    name: 'collector name',
                    provider: 'aws',
                    plugin_info: {
                        plugin_id: 'plugin-1',
                        version: '1.0',
                        upgrade_mode: 'AUTO',
                    },
                };
                state.loading = false;
            }, 2000);
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const NoData: Story = {
    render: () => ({
        components: { PDefinitionTable },
        template: `
            <p-definition-table />
        `,
    }),
};

export const Loading: Story = {
    render: () => ({
        components: { PDefinitionTable },
        template: `
            <p-definition-table
            :fields="fields"
            :data="data"
            loading
            />
        `,
        setup() {
            const state = reactive({
                fields: [
                    { label: 'Id', name: 'collector_id' },
                    { label: 'Name', name: 'name' },
                    { label: 'Provider', name: 'provider' },
                    { label: 'Plugin', name: 'plugin_info' },
                ],
                data: {
                    collector_id: 'collector-abcdefg',
                    name: 'collector name',
                    provider: 'aws',
                    plugin_info: {
                        plugin_id: 'plugin-1',
                        version: '1.0',
                        upgrade_mode: 'AUTO',
                    },
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PDefinitionTable, PButton },
        template: `
            <div>
                <p class="mb-4 text-lg font-bold">Slot: data</p>
                <p-definition-table
                    :fields="fields"
                    :data="data"
                >
                    <template #data="{value}">
                        <span class="text-secondary-dark">{{value}}</span>
                    </template>
                </p-definition-table>
                <p class="mb-4 text-lg font-bold">Slot: data-{field.name}</p>
                <p-definition-table
                    :fields="fields"
                    :data="data"
                >
                    <template #data-name="{value}">
                        <span class="text-secondary-dark">{{value}}</span>
                    </template>
                </p-definition-table>
                <p class="mb-4 text-lg font-bold">Slot: data-{field index}</p>
                <p-definition-table
                    :fields="fields"
                    :data="data"
                >
                    <template #data-name="{index, value}">
                        <span class="text-secondary-dark">{{index}}. {{value}}</span>
                    </template>
                </p-definition-table>
                <p class="my-4 text-lg font-bold">Slot: key</p>
                <p-definition-table
                    :fields="fields"
                    :data="data"
                >
                    <template #key="{label}">
                        <span class="text-secondary-dark">{{label}}</span>
                    </template>
                </p-definition-table>
                <p class="my-4 text-lg font-bold">Slot: extra</p>
                <p-definition-table
                    :fields="fields"
                    :data="data"
                >
                    <template #extra="{label}">
                        <div class="text-peacock mr-4 w-full text-right"><p-button style-type="highlight" size="sm">Edit</p-button></div>
                    </template>
                </p-definition-table>
                <p class="my-4 text-lg font-bold">Slot: loading</p>
                <p-definition-table
                    :fields="fields"
                    :data="data"
                    loading
                >
                    <template #loading>
                        <span class="text-secondary-dark">Loading...</span>
                    </template>
                </p-definition-table>
                <p class="my-4 text-lg font-bold">Slot: no-data</p>
                <p-definition-table
                    :fields="fields"
                    :data="{}"
                >
                    <template #no-data>
                        <span class="text-secondary-dark">No Data</span>
                    </template>
                </p-definition-table>
            </div>
            <!--<div>-->
        `,
        setup() {
            const state = reactive({
                fields: [
                    { label: 'Id', name: 'collector_id' },
                    { label: 'Name', name: 'name' },
                    { label: 'Provider', name: 'provider' },
                ],
                data: {
                    collector_id: `collector-${faker.random.alphaNumeric(7)}`,
                    name: 'collector name',
                    provider: 'aws',
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const DisableCopy: Story = {
    render: () => ({
        components: { PDefinitionTable },
        template: `
            <div>
            <p class="text-xl mb-4">Globally disable copy button</p>
            <p-definition-table
                :fields="fields"
                :data="data"
                disable-copy
            />
            <p class="text-xl my-4">Disable specific row(field)'s copy button</p>
            <p-definition-table
                :fields="fields"
                :data="data"
            />
            </div>
        `,
        setup() {
            const state = reactive({
                fields: [
                    { label: 'Id', name: 'collector_id' },
                    { label: 'Name', name: 'name' },
                    { label: 'Provider', name: 'provider', disableCopy: true },
                    { label: 'Plugin', name: 'plugin_info' },
                ],
                data: {
                    collector_id: 'collector-abcdefg',
                    name: 'collector name',
                    provider: 'aws',
                    plugin_info: {
                        plugin_id: 'plugin-1',
                        version: '1.0',
                        upgrade_mode: 'AUTO',
                    },
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const CustomCopyValue: Story = {
    render: () => ({
        components: { PDefinitionTable },
        template: `
            <div>
            <p class="text-xl mb-4">Fields:</p>
            <pre class="mb-4">
            [
                { label: 'Name', name: 'name', copyValueFormatter: () => data.collector_id },
                { label: 'Provider', name: 'provider', copyValue: 'AWS' },
            ]
            </pre>
            <p-definition-table
                :fields="fields"
                :data="data"
            />
            </div>
        `,
        setup() {
            const state = reactive({
                fields: [
                    { label: 'Name', name: 'name', copyValueFormatter: () => state.data.collector_id },
                    { label: 'Provider', name: 'provider', copyValue: 'AWS' },
                ],
                data: {
                    collector_id: `collector-${faker.random.alphaNumeric(7)}`,
                    name: 'collector name',
                    provider: 'aws',
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Block: Story = {
    render: () => ({
        components: { PDefinitionTable, PButton },
        template: `
            <div>
            <p class="text-xl mb-4">Make all value columns expand</p>
            <p-definition-table
                :fields="fields"
                :data="data"
                block
            >
                <template #extra>
                    <p-button style-type="highlight" size="sm">Edit</p-button>
                </template>
            </p-definition-table>
            <p class="text-xl my-4">Make specific row(field)'s value column expand</p>
            <p-definition-table
                :fields="fields"
                :data="data"
            >
                <template #extra>
                    <p-button style-type="highlight" size="sm">Edit</p-button>
                </template>
            </p-definition-table>
            </div>
            <!-- <div> -->
        `,
        setup() {
            const state = reactive({
                fields: [
                    { label: 'Id', name: 'collector_id' },
                    { label: 'Name', name: 'name' },
                    { label: 'Provider', name: 'provider', block: true },
                ],
                data: {
                    collector_id: `collector-${faker.random.alphaNumeric(7)}`,
                    name: 'collector name',
                    provider: 'aws',
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PDefinitionTable },
        template: `
            <div>
            <p class="mb-4 text-lg font-bold">Style Type: {{DEFINITION_TABLE_STYLE_TYPE.primary}}</p>
            <p-definition-table
                :fields="fields"
                :data="data"
                :style-type="DEFINITION_TABLE_STYLE_TYPE.primary"
            />
            <p class="mb-4 text-lg font-bold">Style Type: {{DEFINITION_TABLE_STYLE_TYPE.white}}</p>
            <p-definition-table
                :fields="fields"
                :data="data"
                :style-type="DEFINITION_TABLE_STYLE_TYPE.white"
            />
            </div>
        `,
        setup() {
            const state = reactive({
                fields: [
                    { label: 'Id', name: 'collector_id' },
                    { label: 'Name', name: 'name' },
                    { label: 'Provider', name: 'provider' },
                ],
                data: {
                    collector_id: `collector-${faker.random.alphaNumeric(7)}`,
                    name: 'collector name',
                    provider: 'aws',
                },
            });
            return {
                ...toRefs(state),
                DEFINITION_TABLE_STYLE_TYPE,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
