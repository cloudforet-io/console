<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import {
    PDataTable, PToggleButton, PLink, PTooltip, PI,
} from '@cloudforet/mirinae';

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

interface MonthData {
    budget: number;
    budget_usage: number;
}

interface DataByMonth {
    [key: string]: MonthData;
}

const props = defineProps<Props>();

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const appContextStore = useAppContextStore();

const budgetData = computed(() => budgetPageStore.$state.budgetData);
const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);



const formatNumberToShort = (number: number) => {
    if (number >= 1000000000) {
        const value = number / 1000000000;
        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(2)}T`;
    }
    if (number >= 1000000) {
        const value = number / 1000000;
        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(2)}M`;
    }
    if (number >= 1000) {
        const value = number / 1000;
        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(2)}K`;
    }
    return number.toString();
};

const state = reactive({
    data: computed(() => props.data),
    isOriginalData: true,
    refinedData: computed(() => state.data.map((d) => ({
        ...d,
        budget_usage: d.budget * props.data.length,
    }))),
});

const tableState = reactive({
    fields: computed(() => {
        if (!state.data.length) return [];

        return [
            {
                name: 'category',
                label: '',
                width: '250px',
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

        const monthKeys = Object.keys(dataByMonth).sort((a, b) => {
            const yearA = Number(a.slice(2, 6));
            const monthA = Number(a.slice(0, 2));
            const yearB = Number(b.slice(2, 6));
            const monthB = Number(b.slice(0, 2));

            if (yearA !== yearB) {
                return yearA - yearB;
            }
            return monthA - monthB;
        });
        const totalBudget = budgetData.value?.limit ?? 0;
        let runningTotal = 0;

        const accumulatedSpend = monthKeys.reduce((acc, month) => {
            runningTotal += dataByMonth[month].budget_usage;
            acc[month] = runningTotal;
            return acc;
        }, {} as Record<string, number>);

        return [
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.PLANNED_BUDGET'),
                ...monthKeys.reduce((acc, month) => {
                    acc[month] = totalBudget;
                    return acc;
                }, {}),
            },
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND'),
                ...monthKeys.reduce((acc, month) => {
                    acc[month] = dataByMonth[month].budget_usage;
                    return acc;
                }, {}),
            },
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACCUMULATED_USAGE'),
                ...monthKeys.reduce((acc, month) => {
                    acc[month] = accumulatedSpend[month] || 0;
                    return acc;
                }, {}),
            },
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.USAGE_RATE'),
                ...monthKeys.reduce((acc, month) => {
                    acc[month] = (accumulatedSpend[month] / totalBudget) * 100;
                    return acc;
                }, {}),
            },
            {
                category: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.BUDGET_REMAINING'),
                ...monthKeys.reduce((acc, month) => {
                    acc[month] = totalBudget - accumulatedSpend[month];
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
                <div v-if="value === i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND')"
                     class="flex items-center gap-2"
                >
                    <div class="w-3 h-3 bg-indigo-400 rounded-lg" />
                    <span>{{ value }}</span>
                </div>
                <div v-else-if="value === i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACCUMULATED_USAGE')"
                     class="flex items-center gap-2"
                >
                    <div class="w-3 h-3 bg-peacock-400 rounded-lg" />
                    <span>{{ value }}</span>
                </div>
                <div v-else-if="value === i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.USAGE_RATE')"
                     class="flex items-center gap-2"
                >
                    <span>{{ value }}</span>
                    <!-- eslint-disable-next-line max-len -->
                    <p-tooltip :contents="`${i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACCUMULATED_USAGE')} vs. ${i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.PLANNED_BUDGET')}`">
                        <template #default>
                            <p-i name="ic_info-circle"
                                 width="1rem"
                                 height="1rem"
                            />
                        </template>
                    </p-tooltip>
                </div>
            </template>
            <template #col-format="{ value, field, item }">
                <template v-if="field.name !== 'category'">
                    <span class="block text-right px-4">
                        <template v-if="item.category === $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.PLANNED_BUDGET')">
                            <p class="font-bold text-gray-900">
                                {{ CURRENCY_SYMBOL[budgetPageState.budgetData?.currency ?? 'KRW'] }}
                                {{
                                    state.isOriginalData ? Number(value).toFixed(2).toLocaleString()
                                    : formatNumberToShort(value)
                                }}
                            </p>
                        </template>
                        <template v-else-if="item.category === $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND')">
                            {{ CURRENCY_SYMBOL[budgetPageState.budgetData?.currency ?? 'KRW'] }}
                            {{ state.isOriginalData
                                ? value.toLocaleString()
                                : formatNumberToShort(value) }}
                        </template>
                        <template v-else-if="item.category ===$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACCUMULATED_USAGE')">
                            <p :class="{ exceeded: budgetPageState.budgetData
                                && value > budgetPageState.budgetData?.limit }"
                            >
                                {{ CURRENCY_SYMBOL[budgetPageState.budgetData?.currency ?? 'KRW'] }}
                                {{ state.isOriginalData ? value.toLocaleString() : formatNumberToShort(value) }}
                            </p>
                        </template>
                        <template v-else-if="item.category === $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.USAGE_RATE')">
                            <span :class="{exceeded: value > 100}"
                                  class="italic"
                            >
                                {{ value.toFixed(0) }}%
                            </span>
                        </template>
                        <template v-else-if="item.category === $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.BUDGET_REMAINING')">
                            <p :class="{exceeded: value < 0, 'exceeded-budget': value < 0}">
                                {{ CURRENCY_SYMBOL[budgetPageState.budgetData?.currency ?? 'KRW'] }}
                                {{ !state.isOriginalData
                                    ? formatNumberToShort(Math.abs(value.toFixed(2)))
                                    : Math.abs(value).toLocaleString() }}
                            </p>
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

.exceeded {
    @apply text-red-500;
    &.exceeded-budget {
        &::before {
            content: '-';
        }
    }
}
</style>
