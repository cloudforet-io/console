import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getKeyItemSets, getValueHandlerMap } from '@/inputs/dropdown/filterable-query-dropdown/mock';
import PFilterableQueryDropdown from '@/inputs/dropdown/filterable-query-dropdown/PFilterableQueryDropdown.vue';
import { getFilterableQueryDropdownArgs, getFilterableQueryDropdownParameters, getFilterableQueryDropdownArgTypes } from '@/inputs/dropdown/filterable-query-dropdown/story-helper';

type PFilterableQueryDropdownPropsAndCustomArgs = ComponentProps<typeof PFilterableQueryDropdown>;

const meta : Meta<PFilterableQueryDropdownPropsAndCustomArgs> = {
    title: 'Inputs/Dropdown/Filterable Query Dropdown',
    component: PFilterableQueryDropdown,
    argTypes: {
        ...getFilterableQueryDropdownArgTypes(),
        // 'item-content': { table: { disable: true } },
    },
    parameters: {
        ...getFilterableQueryDropdownParameters(),
    },
    args: {
        ...getFilterableQueryDropdownArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PFilterableQueryDropdown>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown v-model="proxyValue"
                                :keyItemSets="keyItemSets"
                                :valueHandlerMap="valueHandlerMap"
                ></p-filterable-query-dropdown>
            </div>
        `,
        setup(props, { emit }) {
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
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                ></p-filterable-query-dropdown>
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

export const MultiSelectable: Story = {
    render: () => ({
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    multi-selectable
                ></p-filterable-query-dropdown>
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

export const UseFixedMenuStyle: Story = {
    render: () => ({
        components: { PFilterableQueryDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-filterable-query-dropdown
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    use-fixed-menu-style
                    multi-selectable
                ></p-filterable-query-dropdown>
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

export const Playground: Story = {
    ...Template,
};
