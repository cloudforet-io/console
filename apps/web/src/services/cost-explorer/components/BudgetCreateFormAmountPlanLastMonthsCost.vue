<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';


import type { BudgetModel } from '@/schema/cost-analysis/budget/model';

import type { Currency } from '@/store/modules/settings/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { Granularity } from '@/services/cost-explorer/types/cost-explorer-query-type';



type ProviderFilter = BudgetModel['provider_filter'];
type BudgetTimeUnit = BudgetModel['time_unit'];

interface Props {
    projectId?: string;
    projectGroupId?: string;
    providerFilter?: ProviderFilter;
    dataSourceId?: string;
    timeUnit: BudgetTimeUnit;
}

interface BudgetListParams {
    data_source_id: string;
    query: {
        start: string;
        end: string;
        granularity: Granularity;
        sort: { key: string; desc: boolean }[];
        fields: {
            value_sum: {
                key: string;
                operator: string;
            };
        };
    }
}
const allReferenceStore = useAllReferenceStore();

const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    projectGroupId: undefined,
    providerFilter: undefined,
    dataSourceId: undefined,
    timeUnit: 'TOTAL',
});


const recentBudgetApiQueryHelper = new ApiQueryHelper().setPage(1, 3);

const { i18nDayjs } = useI18nDayjs();

const storeState = reactive({
    costDataSource: computed(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    last3MonthsBudgets: [] as BudgetModel[],
    months: computed(() => {
        const today = i18nDayjs.value.utc();
        return [
            today.subtract(1, 'month').startOf('month').format('MMMM YYYY'),
            today.subtract(2, 'month').startOf('month').format('MMMM YYYY'),
            today.subtract(3, 'month').startOf('month').format('MMMM YYYY'),
        ];
    }),
    items: computed(() => state.months.map((month, i) => {
        const data = state.last3MonthsBudgets[i];
        return {
            month: data ? i18nDayjs.value.utc(data.date).format('MMMM YYYY') : month,
            cost: data ? data.value_sum : 0,
        };
    })),
    showList: computed(() => (props.projectId || props.projectGroupId) && props.dataSourceId),
    // api request params
    budgetListParams: computed(() => {
        let filters: ConsoleFilter[] = [];

        if (props.projectId) filters.push({ k: 'project_id', v: props.projectId, o: '=' });
        if (props.providerFilter) filters = filters.concat(getConvertedFilter(props.providerFilter));
        recentBudgetApiQueryHelper.setFilters(filters);

        const today = dayjs.utc();
        const params: BudgetListParams = {
            data_source_id: props.dataSourceId ?? '',
            query: {
                start: today.subtract(3, 'month').startOf('month').format('YYYY-MM'),
                end: today.subtract(1, 'month').endOf('month').format('YYYY-MM'),
                granularity: 'MONTHLY',
                fields: {
                    value_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                ...recentBudgetApiQueryHelper.data,
                sort: [{ key: 'date', desc: true }],
            },

        };

        return params;
    }),
    currency: computed<Currency>(() => {
        if (props.dataSourceId) {
            const targetDataSource = storeState.costDataSource[props.dataSourceId];
            return targetDataSource?.data?.plugin_info?.metadata?.currency ?? 'USD';
        }
        return 'USD';
    }),
});

/* Util */
const getConvertedFilter = (providerFilter: ProviderFilter): ConsoleFilter[] => {
    const results: ConsoleFilter[] = [];
    if (providerFilter.state === 'DISABLED') return results;
    results.push({
        k: 'provider',
        v: providerFilter.providers,
        o: '=',
    });
    return results;
};

/* Api */
const getRecentBudgets = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.cost.analyze(state.budgetListParams);
        state.last3MonthsBudgets = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.last3MonthsBudgets = [];
    }
};

watch([() => props.projectId, () => props.dataSourceId, () => props.projectGroupId], () => {
    if (state.showList) getRecentBudgets();
}, { immediate: true });
</script>

<template>
    <div v-show="state.showList"
         class="budget-create-form-amount-plan-last-months-cost"
    >
        <label>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_LAST_MONTH') }}</label>
        <span v-for="({month, cost}, index) in state.items"
              :key="index"
              class="data"
        >
            {{ month }}: {{ currencyMoneyFormatter(cost, { currency: state.currency }) }}
        </span>
    </div>
</template>

<style lang="postcss" scoped>
.budget-create-form-amount-plan-last-months-cost {
    @apply text-gray-400 text-xs;
    label {
        @apply font-bold;
    }
    .data {
        @apply border-r border-gray-200;
        display: inline-flex;
        padding: 0 0.5rem;
        align-items: center;
        &:last-of-type {
            @apply border-0;
        }
    }

    @screen mobile {
        padding-right: 8.75rem;
        label {
            @apply block;
        }
        .data {
            @apply border-none block;
            padding: 0;
        }
    }
}
</style>
