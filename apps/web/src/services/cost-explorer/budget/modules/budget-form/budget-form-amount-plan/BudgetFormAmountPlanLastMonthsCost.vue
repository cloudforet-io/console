<script lang="ts" setup>
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import dayjs from 'dayjs';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { BudgetData, BudgetTimeUnit, CostTypes } from '@/services/cost-explorer/budget/type';
import { BUDGET_TIME_UNIT } from '@/services/cost-explorer/budget/type';
import type { Granularity } from '@/services/cost-explorer/type';


interface Props {
    projectId?: string;
    projectGroupId?: string;
    costTypes?: CostTypes;
    timeUnit: BudgetTimeUnit;
}

interface BudgetListParams extends Query {
    start: string;
    end: string;
    granularity: Granularity;
}

const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    projectGroupId: undefined,
    costTypes: undefined,
    timeUnit: BUDGET_TIME_UNIT.TOTAL,
});
const store = useStore();
const { t } = useI18n();

const recentBudgetApiQueryHelper = new ApiQueryHelper().setPage(1, 3).setSort('date', true);

const { i18nDayjs } = useI18nDayjs();

const state = reactive({
    last3MonthsBudgets: [] as BudgetData[],
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
            cost: data ? data.usd_cost : 0,
        };
    })),
    showList: computed(() => props.projectId || props.projectGroupId),
    currency: computed(() => store.state.settings.currency),
    // api request params
    budgetListParams: computed(() => {
        let filters: ConsoleFilter[] = [];

        if (props.projectId) filters.push({ k: 'project_id', v: props.projectId, o: '=' });
        if (props.costTypes) filters = filters.concat(getConvertedFilter(props.costTypes));
        recentBudgetApiQueryHelper.setFilters(filters);

        const today = dayjs.utc();
        const params: BudgetListParams = {
            start: today.subtract(3, 'month').startOf('month').format('YYYY-MM-DD'),
            end: today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
            granularity: 'MONTHLY',
            ...recentBudgetApiQueryHelper.data,
        };

        return params;
    }),
});

/* Util */
const getConvertedFilter = (costTypes: CostTypes): ConsoleFilter[] => {
    const results: ConsoleFilter[] = [];
    Object.entries(costTypes).forEach(([type, values]) => {
        if (values?.length) {
            results.push({
                k: type,
                v: values,
                o: '=',
            });
        }
    });
    return results;
};

/* Api */
const getRecentBudgets = async () => {
    try {
        const { results } = await SpaceConnector.client.costAnalysis.cost.analyze(state.budgetListParams);
        state.last3MonthsBudgets = results.sort((a, b) => {
            if (dayjs(a.date).isAfter(dayjs(b.date))) return -1;
            if (dayjs(a.date).isBefore(dayjs(b.date))) return 1;
            return 0;
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.last3MonthsBudgets = [];
    }
};

watch(() => state.budgetListParams, () => {
    if (state.showList) getRecentBudgets();
}, { immediate: true });

</script>

<template>
    <div v-show="state.showList"
         class="budget-form-amount-plan-last-months-cost"
    >
        <label>{{ t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_LAST_MONTH') }}</label>
        <span v-for="({month, cost}, index) in state.items"
              :key="index"
              class="data"
        >
            {{ month }}: {{ currencyMoneyFormatter(cost, state.currency) }}
        </span>
    </div>
</template>

<style lang="postcss" scoped>
.budget-form-amount-plan-last-months-cost {
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
