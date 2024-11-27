import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import PBadge from '@/data-display/badge/PBadge.vue';
import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';
import {
    getBehaviorsAndStatesData,
    getBehaviorsAndStatesFields,
    getUserData, getUserFields,
} from '@/onboarding/data-table/mock';
import { getOnboardingDataTableArgTypes, getOnboardingDataTableParameters, getOnboardingDataTableArgs } from '@/onboarding/data-table/story-helper';

import POnboardingDataTable from './POnboardingDataTable.vue';

type POnboardingDataTablePropsAndCustomArgs = ComponentProps<typeof POnboardingDataTable>;

const meta: Meta<POnboardingDataTablePropsAndCustomArgs> = {
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
                    :stripe="stripe"
                    :border="border"
                    :styleType="styleType"
                    :showFooter="showFooter"
                    :selectable="selectable"
                    :multiSelectable="multiSelectable"
                    :selectIndex.sync="proxySelectIndex"
                    :getRowSelectable="getRowSelectable"
                    :type="type"
                    :columnCopyButton="columnCopyButton"
                    :sortable="sortable"
                    :sortBy.sync="proxySortBy"
                    :sortDesc.sync="proxySortDesc"
                    :headerLeftSlot="headerLeftSlot"
                    :headerRightSlot="headerRightSlot"
                    :columnLeftSlot="columnLeftSlot"
                    :columnRightSlot="columnRightSlot"
                    :disableHover="disableHover"
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
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items" 
                >
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUserData(10, 10),
            };
        },
    }),
};

export const Stripe: Story = {
    render: () => ({
        components: { POnboardingDataTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items"
                    :stripe="stripe"
                >
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUserData(10, 10),
                stripe: true,
            };
        },
    }),
};

export const Loading: Story = {
    render: () => ({
        components: { POnboardingDataTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items"
                    :loading="loading"
                >
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUserData(10, 10),
                loading: true,
            };
        },
    }),
};

export const NoData: Story = {
    render: () => ({
        components: { POnboardingDataTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items"
                >
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: [],
            };
        },
    }),
};

export const ColumnCopyButton: Story = {
    render: () => ({
        components: { POnboardingDataTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items"
                    :columnCopyButton="columnCopyButton"
                >
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUserData(10, 10),
                columnCopyButton: true,
            };
        },
    }),
};

export const HeaderSlot: Story = {
    render: () => ({
        components: { POnboardingDataTable, PBadge },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items"
                    :headerLeftSlot="headerLeftSlot"
                    :headerRightSlot="headerRightSlot"
                >
                    <template #header-left-name-col>
                        <p-badge shape="round" badgeType="solid-outline">
                            1    
                        </p-badge>
                    </template>
                    <template #header-right-name-col>
                        <p-badge shape="round" badgeType="solid-outline">
                            2
                        </p-badge>
                    </template>
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUserData(10, 10),
                headerLeftSlot: true,
                headerRightSlot: true,
            };
        },
    }),
};

export const ColumnSlot: Story = {
    render: () => ({
        components: { POnboardingDataTable, PI },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items"
                    :columnLeftSlot="columnLeftSlot"
                    :columnRightSlot="columnRightSlot"
                >
                    <template #column-left-email>
                        <p-i name="ic_arrow-right-up" width="10px" height="10px" ></p-i>
                        
                    </template>
                    <template #column-right-cost>
                        <p-i name="ic_money-bag" width="15px" height="15px" ></p-i>
                    </template>
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUserData(10, 10),
                columnLeftSlot: true,
                columnRightSlot: true,
            };
        },
    }),
};

export const Sortable: Story = {
    render: () => ({
        components: { POnboardingDataTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-onboarding-data-table 
                    :fields="fields" 
                    :items="items"
                    :sortable="sortable"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    @changeSort="onChangeSort"
                >
                </p-onboarding-data-table>
            </div>
        `,
        setup() {
            const fields = getUserFields();
            const state = reactive({
                fields: getUserFields(),
                items: getUserData(10, 10),
                sortable: true,
                sortBy: '',
                sortDesc: true,
            });

            const onChangeSort = (sortBy, sortDesc) => {
                const multiplier = sortDesc ? -1 : 1;
                state.items.sort((a, b) => {
                    const aVal = a[sortBy];
                    const bVal = b[sortBy];
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return (Number(aVal) - Number(bVal)) * multiplier;
                    }

                    if (aVal < bVal) {
                        return -1 * multiplier;
                    }
                    if (aVal > bVal) {
                        return 1 * multiplier;
                    }
                    return 0;
                });
            };

            return {
                ...toRefs(state),
                fields,
                onChangeSort,
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
                    :selectable="selectable"
                    :multiSelectable="multiSelectable"
                    :disableHover="disableHover"
                    :getRowSelectable="getRowSelectable"
                    :showFooter="showFooter"
                    :selectIndex.sync="proxySelectIndex"
                    @update:selectIndex="onUpdateSelectIndex"
                    :type="type"
                    
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
                        <span v-if="colIndex === 0">Total</span>
                        <span v-if="field.name === 'cost'">{{ sumCost(values) }}</span>
                    </template>
                </p-onboarding-data-table>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                // proxySortBy: useProxyValue('sortBy', props, emit),
                // proxySortDesc: useProxyValue('sortDesc', props, emit),
                proxySelectIndex: useProxyValue('selectIndex', props, emit),
                fields: getBehaviorsAndStatesFields(),
                items: getBehaviorsAndStatesData(6, 6),
                showFooter: false,
            });
            const onClickActionButton = (item) => {
                console.log('Button clicked', item);
            };

            const getRowSelectable = (item) => {
                if (item.cost < 200) return true;
                return false;
            };
            const sumCost = (arr: (number | undefined)[] | any) => arr.reduce((acc, value) => acc + (parseFloat(value) ?? 0), 0).toFixed(2);

            const onUpdateSelectIndex = (values) => {
                console.log('onUpdateSelectIndex', values);
            };
            return {
                ...toRefs(state),
                onClickActionButton,
                getRowSelectable,
                sumCost,
                type: 'checkbox',
                onUpdateSelectIndex,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
