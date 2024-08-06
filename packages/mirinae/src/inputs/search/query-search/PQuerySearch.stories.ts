import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getKeyItemSets, getValueHandlerMap, getValueItems } from '@/inputs/search/query-search/mock';
import { getQuerySearchArgs, getQuerySearchParameters, getQuerySearchArgTypes } from '@/inputs/search/query-search/story-helper';
import { getTextHighlightRegex } from '@/utils/helpers';

import PQuerySearch from './PQuerySearch.vue';

type PQuerySearchPropsAndCustomArgs = ComponentProps<typeof PQuerySearch>;

const meta : Meta<PQuerySearchPropsAndCustomArgs> = {
    title: 'Inputs/Search/Query Search',
    component: PQuerySearch,
    argTypes: {
        ...getQuerySearchArgTypes(),
    },
    parameters: {
        ...getQuerySearchParameters(),
    },
    args: {
        ...getQuerySearchArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PQuerySearch>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PQuerySearch },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-search v-model="proxyValue"
                    :keyItemSets="keyItemSets"
                    :valueHandlerMap="valueHandlerMap"
                ></p-query-search>
            </div>
        `,
        setup(props, emit) {
            const state = reactive({
                proxyValue: useProxyValue('value', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PQuerySearch },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-search
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    @search="queryItem = $event"
                ></p-query-search>
                <div class="my-2 p-4 rounded bg-gray-200">
                    <p class="mb-2 text-lg">Searched:</p>
                    <pre>{{queryItem}}</pre>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                queryItem: null,
            });
            const keyItemSets = getKeyItemSets(5, 1);
            const valueHandlerMap = getValueHandlerMap(keyItemSets);
            return {
                ...toRefs(state),
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const WithSeveralKeyItemSets: Story = {
    render: () => ({
        components: { PQuerySearch },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-search
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                ></p-query-search>
                <div class="my-2 p-4 rounded bg-gray-200 overflow-auto">
                    <p class="mb-2 text-lg">Key Item Sets:</p>
                    <pre>{{keyItemSets}}</pre>
                </div>
            </div>
        `,
        setup() {
            const keyItemSets = getKeyItemSets(3, 4);
            const valueHandlerMap = getValueHandlerMap(keyItemSets);
            return {
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const ValueHandler: Story = {
    render: () => ({
        components: { PQuerySearch },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-search
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                ></p-query-search>
                <div class="my-2 p-4 rounded bg-gray-200 overflow-auto">
                    <p class="mb-2 text-lg">Key Item Sets:</p>
                    <pre>{{keyItemSets}}</pre>
                </div>
                <div class="my-2 p-4 rounded bg-gray-200 overflow-auto">
                    <p class="mb-2 text-lg">Value Items:</p>
                    <pre>{{valueItemsMap}}</pre>
                </div>
            </div>
        `,
        setup() {
            const keyItemSets = [{
                title: 'Keys',
                items: [
                    { label: 'Hello', name: 'hello' },
                    { label: 'World', name: 'world' },
                ],
            }];
            const valueItemsMap = {
                hello: [
                    { label: 'This is suggestion for hello', name: 'hello1' },
                    { label: 'Pick me!', name: 'hello2' },
                ],
                world: [
                    { label: 'This is suggestion for world', name: 'world1' },
                    { label: 'If input value contains any of these items,', name: 'world2' },
                    { label: 'you can see on the menu!', name: 'world3' },
                ],
            };
            const valueHandler = (inputText, rootKey) => {
                let results = valueItemsMap[rootKey.name];
                if (inputText) {
                    const regex = getTextHighlightRegex(inputText);
                    results = results.filter((d) => regex.test(d.label));
                }
                return {
                    results,
                    totalCount: results.length,
                };
            };
            const valueHandlerMap = {
                hello: valueHandler,
                world: valueHandler,
            };
            return {
                keyItemSets,
                valueItemsMap,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const NestedKeySearch: Story = {
    render: () => ({
        components: { PQuerySearch },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-search
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    @search="queryItem = $event"
                ></p-query-search>
                <div class="my-2 p-4 rounded bg-gray-200 overflow-auto">
                    <p class="mb-2 text-lg">Searched:</p>
                    <pre>{{queryItem}}</pre>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                queryItem: null,
            });
            const keyItemSets = [{
                title: 'Keys',
                items: [
                    { label: 'Root Key', name: 'root', dataType: 'object' },
                ],
            }];
            const valueItemsMap = {
                nested: [
                    { label: 'Nested', name: 'nested' },
                    { label: 'Last', name: 'last' },
                ],
                last: getValueItems(10),
            };
            const valueHandler = (inputText, rootKey, dataType, subPath) => {
                const nextDataType = subPath && subPath.endsWith('last') ? 'string' : 'object';
                let results;
                if (nextDataType === 'object') {
                    results = valueItemsMap.nested;
                } else {
                    results = valueItemsMap.last;
                }
                if (inputText) {
                    const regex = getTextHighlightRegex(inputText);
                    results = results.filter((d) => regex.test(d.label));
                }
                return {
                    results,
                    totalCount: results.length,
                    dataType: nextDataType,
                };
            };
            const valueHandlerMap = {
                root: valueHandler,
            };
            return {
                ...toRefs(state),
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const DataTypes: Story = {
    render: () => ({
        components: { PQuerySearch },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-search
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    @search="queryItem = $event"
                ></p-query-search>
                <div class="my-2 p-4 rounded bg-gray-200 overflow-auto">
                    <p class="mb-2 text-lg">Searched:</p>
                    <pre>{{queryItem}}</pre>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                queryItem: null,
            });
            const keyItemSets = [{
                title: 'Keys',
                items: [
                    { label: 'string', name: 'string' },
                    { label: 'integer', name: 'integer', dataType: 'integer' },
                    { label: 'float', name: 'float', dataType: 'float' },
                    { label: 'boolean', name: 'boolean', dataType: 'boolean' },
                    { label: 'datetime', name: 'datetime', dataType: 'datetime' },
                    { label: 'object', name: 'object', dataType: 'object' },
                ],
            }];
            const valueItemsMap = {
                string: getValueItems(5),
                integer: [{ label: 1, name: 1 }, { label: 3, name: 3 }],
                float: [{ label: 0.33, name: 0.33 }, { label: 28.224, name: 28.224 }],
                object: getValueItems(5),
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const valueHandler = (inputText, rootKey, dataType, subPath) => {
                let results = valueItemsMap[rootKey.name];
                if (inputText) {
                    const regex = getTextHighlightRegex(inputText);
                    results = results.filter((d) => regex.test(d.label));
                }
                return {
                    results,
                    totalCount: results.length,
                };
            };
            const valueHandlerMap = {
                string: valueHandler,
                integer: valueHandler,
                float: valueHandler,
                object: valueHandler,
            };
            return {
                ...toRefs(state),
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const Operators: Story = {
    render: () => ({
        components: { PQuerySearch },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-search
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    @search="queryItem = $event"
                ></p-query-search>
                <div class="my-2 p-4 rounded bg-gray-200 overflow-auto">
                    <p class="mb-2 text-lg">Searched:</p>
                    <pre>{{queryItem}}</pre>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                queryItem: null,
            });
            const keyItemSets = [{
                title: 'Keys',
                items: [
                    { label: 'All Operators', name: 'all' },
                    { label: 'Restricted Operators(=, !=)', name: 'restricted', operators: ['=', '!='] },
                    { label: 'Nested', name: 'nested' },
                ],
            }];
            const valueItems = getValueItems(5);
            const valueHandler = (inputText, rootKey) => {
                let results = valueItems;
                if (inputText) {
                    const regex = getTextHighlightRegex(inputText);
                    results = results.filter((d) => regex.test(d.label));
                }
                return {
                    results,
                    totalCount: results.length,
                    operators: rootKey.name === 'nested' ? ['=', '!='] : undefined,
                };
            };
            const valueHandlerMap = {
                all: valueHandler,
                restricted: valueHandler,
                nested: valueHandler,
            };
            return {
                ...toRefs(state),
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const Playground: Story = {
    ...Template,
};
