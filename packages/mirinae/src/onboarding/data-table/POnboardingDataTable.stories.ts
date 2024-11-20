import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';


import PButton from '@/controls/buttons/button/PButton.vue';
import PBadge from '@/data-display/badge/PBadge.vue';
import { useProxyValue } from '@/hooks';
import {
    getData, getDataFields, getUser2Data, getUser2Fields,
} from '@/onboarding/data-table/mock';
import { getOnboardingDataTableArgTypes, getOnboardingDataTableParameters, getOnboardingDataTableArgs } from '@/onboarding/data-table/story-helper';

import POnboardingDataTable from './POnboardingDataTable.vue';


type POnboardingDataTablePropsAndCustomArgs = ComponentProps<typeof POnboardingDataTable>;

const meta : Meta<POnboardingDataTablePropsAndCustomArgs> = {
    title: 'Onboarding/Data Table',
    component: POnboardingDataTable,
    argTypes: {
        ...getOnboardingDataTableArgTypes(),
    },
    parameters: {
        ...getOnboardingDataTableParameters(),
    },
    args: {
        ...getOnboardingDataTableArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof POnboardingDataTable>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { POnboardingDataTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table
                    :loading="loading"
                    :fields="fields"
                    :items="items"
                    :sortable="sortable"
                    :sortBy.sync="proxySortBy"
                    :sortDesc.sync="proxySortDesc"
                    :colCopy="colCopy"
                    :selectable="selectable"
                    :selectIndex.sync="proxySelectIndex"
                    :multiSelect="multiSelect"
                    :rowClickMultiSelectMode="rowClickMultiSelectMode"
                    :useCursorLoading="useCursorLoading"
                    :tableStyleType="tableStyleType"
                    :tableCustomStyle="tableCustomStyle"
                    :striped="striped"
                    :bordered="bordered"
                    :disableHover="disableHover"
                    :rowHeightFixed="rowHeightFixed"
                    :rowCursorPointer="rowCursorPointer"
                    :invalid="invalid"
                    :getRowClassNames="getRowClassNames"
                    :getRowSelectable="getRowSelectable"
                    :beautify-text="beautifyText"
                    :showFooter="showFooter"
                    @select="onSelect"
                    @rowLeftClick="onRowLeftClick"
                    @changeSort="onChangeSort"
                    @update:selectIndex="onUpdateSelectIndex"
                    @update:sortBy="onUpdateSortBy"
                    @update:sortDesc="onUpdateSortDesc"
                >
                </p-onboarding-data-table>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySortBy: useProxyValue('sortBy', props, emit),
                proxySortDesc: useProxyValue('sortDesc', props, emit),
                proxySelectIndex: useProxyValue('selectIndex', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { POnboardingDataTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table :fields="fields" :items="items" />
            </div>
        `,
        setup() {
            return {
                fields: getUser2Fields(),
                items: getUser2Data(10, 10),
            };
        },
    }),
};

export const BehaviorsAndStates: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { POnboardingDataTable, PBadge, PButton },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table
                    :loading="loading"
                    :fields="fields"
                    :items="items"
                    :sortable="sortable"
                    :sortBy.sync="proxySortBy"
                    :sortDesc.sync="proxySortDesc"
                    :colCopy="colCopy"
                    :selectable="selectable"
                    :selectIndex.sync="proxySelectIndex"
                    :multiSelect="multiSelect"
                    :rowClickMultiSelectMode="rowClickMultiSelectMode"
                    :useCursorLoading="useCursorLoading"
                    :tableStyleType="tableStyleType"
                    :tableCustomStyle="tableCustomStyle"
                    :striped="striped"
                    :bordered="bordered"
                    :disableHover="disableHover"
                    :rowHeightFixed="rowHeightFixed"
                    :rowCursorPointer="rowCursorPointer"
                    :invalid="invalid"
                    :getRowClassNames="getRowClassNames"
                    :getRowSelectable="getRowSelectable"
                    :beautify-text="beautifyText"
                    :showFooter="showFooter"
                    @select="onSelect"
                    @rowLeftClick="onRowLeftClick"
                    @changeSort="onChangeSort"
                    @update:selectIndex="onUpdateSelectIndex"
                    @update:sortBy="onUpdateSortBy"
                    @update:sortDesc="onUpdateSortDesc"
                    
                >
                    <template #col-job_type-format="{ item, field, value, colIndex}">
                        <p-badge shape="round">
                            {{ value }}    
                        </p-badge>
                    </template>
                    <template #col-action-format="{item, field, colIndex}">
                        <p-button styleType="tertiary" size="sm" @click="onClickActionButton(item)">
                            Button
                        </p-button>
                    </template>
                    <template #tf-col-format="{field, colIndex, values}">
                        <span v-if="colIndex === 0">Footer</span>
                        <span v-else-if="field.name === 'cost'">{{ sumCost(values) }}</span>
                    </template>
                </p-onboarding-data-table>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySortBy: useProxyValue('sortBy', props, emit),
                proxySortDesc: useProxyValue('sortDesc', props, emit),
                proxySelectIndex: useProxyValue('selectIndex', props, emit),
                selectable: true,
                multiSelect: true,
                fields: getDataFields(),
                items: getData(6, 6),
                showFooter: true,
            });
            const onClickActionButton = (item) => {
                console.log('Button clicked', item);
            };

            const getRowSelectable = (item) => {
                if (item.cost < 200) return true;
                return false;
            };
            const sumCost = (arr: (number | undefined)[] | any) => arr.reduce((acc, value) => acc + (parseFloat(value) ?? 0), 0).toFixed(2);

            return {
                ...toRefs(state),
                onClickActionButton,
                getRowSelectable,
                sumCost,


            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
