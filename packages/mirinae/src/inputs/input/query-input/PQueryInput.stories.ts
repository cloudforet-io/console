import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks/proxy-state';
import { getKeyItemSets, getValueHandlerMap, getValueItems } from '@/inputs/input/query-input/mock';
import { getQueryInputArgs, getQueryInputArgTypes, getQueryInputParameters } from '@/inputs/input/query-input/story-helper';
import { INPUT_SIZE } from '@/inputs/input/text-input/type';
import { getTextHighlightRegex } from '@/utils/helpers';

import PQueryInput from './PQueryInput.vue';

type PQueryInputPropsAndCustomArgs = ComponentProps<typeof PQueryInput>;

const meta : Meta<PQueryInputPropsAndCustomArgs> = {
    title: 'Inputs/Input/Query Input',
    component: PQueryInput,
    argTypes: {
        ...getQueryInputArgTypes(),
    },
    parameters: {
        ...getQueryInputParameters(),
    },
    args: {
        ...getQueryInputArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PQueryInput>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PQueryInput },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-input :value="value"
                               :size="size"
                               :disabled="disabled"
                               :block="block"
                               :invalid="invalid"
                               :placeholder="placeholder"
                               :multi-input="multiInput"
                               :selected.sync="proxySelected"
                               :keyItemSets="keyItemSets"
                               :valueHandlerMap="valueHandlerMap"
                               :visible-menu="proxyVisibleMenu"
                               :use-fixed-menu-style="useFixedMenuStyle"
                               :appearance-type="appearanceType"
                ></p-query-input>
            </div>
        `,
        setup(props, { emit }) {
            return {
                proxyVisibleMenu: useProxyValue('visibleMenu', props, emit),
                proxySelected: useProxyValue('selected', props, emit),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <div class="h-full w-full overflow p-8">
            <p-query-input
                :key-item-sets="keyItemSets"
                :value-handler-map="valueHandlerMap"
            ></p-query-input>
            </div>
        `,
        setup() {
            const keyItemSets = getKeyItemSets(5, 1);
            const valueHandlerMap = getValueHandlerMap(keyItemSets);
            return {
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};

export const MultiInput: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <div class="w-full overflow p-8" style="height: 500px">
                <p-query-input
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    multi-input
                    use-fixed-menu-style
                ></p-query-input>
                <br/>
            </div>
        `,
        setup() {
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
                last: getValueItems(30),
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
                    dataType: nextDataType,
                    more: true,
                };
            };
            const valueHandlerMap = {
                root: valueHandler,
            };
            return {
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
};

export const UseFixedMenuStyle: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-query-input
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    use-fixed-menu-style
                    multi-input
                ></p-query-input>
            </div>
        `,
        setup() {
            const keyItemSets = getKeyItemSets(5, 1);
            const valueHandlerMap = getValueHandlerMap(keyItemSets);
            return {
                keyItemSets,
                valueHandlerMap,
            };
        },
    }),
};

export const Placeholder: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <p-query-input placeholder="Placeholder" />
        `,
    }),
};

export const AppearanceType: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Single input with 'basic', 'badge', 'stack' appearance type</p>
                <p-query-input :key-item-sets="keyItemSets" :value-handler-map="valueHandlerMap" :selected.sync="selected" block appearance-type="basic" />
                <br/>
                <hr/>
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'basic' appearance type</p>
                <p-query-input :key-item-sets="keyItemSets" :value-handler-map="valueHandlerMap" :selected.sync="selected" multi-input block />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'badge' appearance type</p>
                <p-query-input :key-item-sets="keyItemSets" :value-handler-map="valueHandlerMap" :selected.sync="selected" multi-input block appearance-type="badge" />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'stack' appearance type</p>
                <p-query-input :key-item-sets="keyItemSets" :value-handler-map="valueHandlerMap" :selected.sync="selected" multi-input block appearance-type="stack" />
                <br/>
                <br/>
                <div class="p-4 bg-blue-200 w-full max-h-64 overflow-y-auto">
                    <p class="font-lg font-bold">selected: </p>
                    <pre>{{selected}}</pre>
                </div>
            </div>
        `,
        setup() {
            const keyItemSets = getKeyItemSets(5, 1);
            const state = reactive({
                keyItemSets,
                valueHandlerMap: getValueHandlerMap(keyItemSets),
                selected: [
                    { key: { label: 'Hello', name: 'hello' }, value: { label: 'Hi', name: 'hi' } },
                    { key: { label: 'Tags', name: 'tags.aws.Environment' }, value: { label: 'Dev', name: 'dev' } },
                ],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Disabled: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <p-query-input :value="value" disabled />
        `,
        setup() {
            const state = reactive({
                value: 'value',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Block: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <div>
                <p-query-input block />
            </div>
        `,
    }),
};

export const Invalid: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <p-query-input :value="value" invalid />
        `,
        setup() {
            const state = reactive({
                value: 'value',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Size: Story = {
    render: () => ({
        components: { PQueryInput },
        template: `
            <div  style="display:flex; flex-direction: column; row-gap: 1.5rem;">
                <p-query-input v-for="size in sizes" :key="size" :size="size"  :placeholder="size" />
            </div>
        `,
        setup() {
            const state = reactive({
                value: '',
                sizes: Object.values(INPUT_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
    decorators: [() => ({
        template: '<story style="height: 300px;" />',
    })],
};
