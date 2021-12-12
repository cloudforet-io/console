<template>
    <div v-show="showList" class="budget-form-amount-plan-last-months-cost">
        <label>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_LAST_MONTH') }}</label>
        <span v-for="({month, cost}, index) in items" :key="index" class="data">
            {{ month }}: {{ currencyMoneyFormatter(cost, currency) }}
        </span>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { BUDGET_TIME_UNIT, BudgetData } from '@/services/billing/cost-management/budget/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { Query } from '@spaceone/console-core-lib/space-connector/type';
import {
    getConvertedFilter,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { CostQueryFilters } from '@/services/billing/cost-management/type';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { store } from '@/store';
import dayjs from 'dayjs';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';

interface Props {
    projectId?: string;
    projectGroupId?: string;
    costTypes?: CostQueryFilters;
    timeUnit: BUDGET_TIME_UNIT;
}

interface BudgetListParams extends Query {
    start: string;
    end: string;
    granularity: GRANULARITY;
}

export default {
    name: 'BudgetFormAmountPlanLastMonthsCost',
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        projectGroupId: {
            type: String,
            default: undefined,
        },
        costTypes: {
            type: Object,
            default: undefined,
        },
        timeUnit: {
            type: String,
            default: BUDGET_TIME_UNIT.TOTAL,
        },
    },
    setup(props: Props) {
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
                    month: data ? i18nDayjs.value(data.date).format('MMMM YYYY') : month,
                    cost: data ? data.usd_cost : 0,
                };
            })),
            showList: computed(() => props.projectId || props.projectGroupId),
            currency: computed(() => store.state.display.currency),
            // api request params
            budgetListParams: computed(() => {
                let filters: QueryStoreFilter[] = [];

                if (props.projectId) filters.push({ k: 'project_id', v: props.projectId, o: '=' });
                if (props.costTypes) filters = filters.concat(getConvertedFilter(props.costTypes));
                recentBudgetApiQueryHelper.setFilters(filters);

                const today = dayjs.utc();
                const params: BudgetListParams = {
                    start: today.subtract(3, 'month').startOf('month').toISOString(),
                    end: today.subtract(1, 'month').endOf('month').toISOString(),
                    granularity: 'MONTHLY',
                    ...recentBudgetApiQueryHelper.data,
                };


                return params;
            }),
        });

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

        return {
            ...toRefs(state),
            currencyMoneyFormatter,

        };
    },

};
</script>

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
