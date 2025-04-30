<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import { PDataTable, PToggleButton, PLink } from '@cloudforet/mirinae';


import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';

import { arrayToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


interface Props {
    data: any;
}

const props = defineProps<Props>();

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const appContextStore = useAppContextStore();

const budgetData = computed(() => budgetPageState.budgetData);
const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

const formatNumberToShort = (number: number) => {
    if (number >= 1000000000) {
        const value = number / 1000000000;
        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(3)}B`;
    }
    if (number >= 1000000) {
        const value = number / 1000000;
        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(3)}M`;
    }
    if (number >= 1000) {
        const value = number / 1000;
        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(3)}K`;
    }
    return number.toString();
};

interface MonthData {
    budget: number;
    budget_usage: number;
}

interface DataByMonth {
    [key: string]: MonthData;
}

const state = reactive({
    data: computed(() => props.data),
    isOriginalData: true,
});

const tableState = reactive({
    fields: computed(() => {
        if (!state.data.length) return [];

        return [
            {
                name: 'category',
                label: '',
                width: '200px',
            },
            ...state.data.map((d) => ({
                name: dayjs.utc(d.date).format('MMYYYY'),
                label: dayjs.utc(d.date).format('MMM YYYY'),
                textAlign: 'right',
                width: '180px',
            })),
        ];
    }),
    items: computed(() => {
        if (!state.data.length) return [];

        const dataByMonth = state.data.reduce((acc, curr) => {
            const monthKey = dayjs.utc(curr.date).format('MMYYYY');
            acc[monthKey] = {
                budget: curr.budget,
                budget_usage: curr.budget_usage,
            };
            return acc;
        }, {} as DataByMonth);

        return [
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.PLANNED_BUDGET'),
                ...Object.entries(dataByMonth).reduce((acc, [month, data]: any) => {
                    acc[month] = data.budget;
                    return acc;
                }, {}),
            },
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND'),
                ...Object.entries(dataByMonth).reduce((acc, [month, data]: any) => {
                    acc[month] = data.budget_usage;
                    return acc;
                }, {}),
            },
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.USAGE_RATE'),
                ...Object.entries(dataByMonth).reduce((acc, [month, data]: any) => {
                    acc[month] = Math.floor((data.budget_usage / data.budget) * 100);
                    return acc;
                }, {}),
            },
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.BUDGET_REMAINING'),
                ...Object.entries(dataByMonth).reduce((acc, [month, data]: any) => {
                    acc[month] = data.budget - data.budget_usage;
                    return acc;
                }, {}),
            },
        ];
    }),
});

const handleToggleOriginalData = (value: boolean) => {
    state.isOriginalData = value;
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
            <span class="font-bold">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.ORIGINAL_DATA') }}</span>
            <p-toggle-button :value="state.isOriginalData"
                             @update:value="handleToggleOriginalData"
            />
        </div>
        <p-data-table
            :fields="tableState.fields"
            :items="tableState.items"
        >
            <template #th-category>
                <span />
            </template>
            <template #col-category-format="{value}">
                <div v-if="value === i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.PLANNED_BUDGET')"
                     class="flex items-center gap-2"
                >
                    <div class="w-3 h-3 bg-indigo-100 rounded-lg" />
                    <span>{{ value }}</span>
                </div>
                <div v-else-if="value === i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND')"
                     class="flex items-center gap-2"
                >
                    <div class="w-3 h-3 bg-indigo-400 rounded-lg" />
                    <span>{{ value }}</span>
                </div>
                <span v-else>{{ value }}</span>
            </template>
            <template #col-format="{ value, field, item }">
                <template v-if="field.name !== 'category'">
                    <span class="block text-right">
                        <template v-if="item.category !== i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.USAGE_RATE')">
                            <p>
                                <span>{{ CURRENCY_SYMBOL[budgetData?.currency ?? 'KRW'] }} </span>
                                <span :class="{bold: item.category === i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.PLANNED_BUDGET')}">
                                    {{ state.isOriginalData
                                        ? value.toLocaleString()
                                        : formatNumberToShort(value) }}
                                </span>
                            </p>
                        </template>
                        <template v-else>
                            <span class="italic">{{ value }}%</span>
                        </template>
                    </span>
                </template>
            </template>
        </p-data-table>
        <p-link :to="{
                    name: isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    params: {
                        dataSourceId: UNIFIED_COST_KEY,
                        costQuerySetId: DYNAMIC_COST_QUERY_SET_PARAMS,
                    },
                    query: {
                        granularity: primitiveToQueryString('MONTHLY'),
                        group_by: arrayToQueryString(['project_id']),
                        filters: arrayToQueryString([
                            {
                                k: 'project_id',
                                v: budgetPageState.budgetData?.project_id ? [budgetPageState.budgetData.project_id] : [],
                                o: '',
                            },
                            {
                                k: 'service_account_id',
                                v: budgetPageState.budgetData?.service_account_id ? [budgetPageState.budgetData.service_account_id] : [],
                                o: '',
                            },
                        ]),
                    }
                }"
                highlight
                class="link"
                action-icon="external-link"
        >
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.GO_TO_COST_ANALYSIS') }}
        </p-link>
    </div>
</template>

<style scoped lang="postcss">
.text-alert {
    @apply text-red-500;
}

.link {
    @apply pb-14;
    margin: 0 auto;
}

.bold {
    @apply font-bold;
}
</style>
