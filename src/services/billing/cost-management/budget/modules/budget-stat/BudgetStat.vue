<template>
    <div class="budget-stat">
        <div class="card-box">
            <div class="title">
                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.STAT.TOTAL_COST') }}</span>
            </div>
            <div v-if="!loading" class="stat">
                <span class="symbol">$</span><span>{{ currencyMoneyFormatter(totalCost) }}</span>
            </div>
            <div v-if="!loading" class="description">
                <span v-if="amountPlanningFilter==='total'">{{ formattedBudgetStart }} ~ {{ formattedBudgetEnd }}(MTD)</span>
                <span v-else>{{ thisMonth }} (MTD)</span>
            </div>
        </div>
        <div class="card-box">
            <div class="title">
                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.STAT.TOTAL_BUDGET') }}</span>
            </div>
            <div v-if="!loading" class="stat">
                <span class="symbol">$</span><span>{{ currencyMoneyFormatter(totalBudget) }}</span>
            </div>
            <div v-if="!loading" class="description">
                ${{ availableBudget.toFixed(2) }} {{ $t('BILLING.COST_MANAGEMENT.BUDGET.STAT.AVAILABLE') }}
            </div>
        </div>
        <div class="card-box">
            <div class="title">
                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.STAT.BUDGET_USAGE') }}</span>
            </div>
            <div v-if="!loading" class="stat">
                <span>{{ noBudgets ? '--&nbsp;' : budgetUsage.toFixed(2) }}</span><span class="symbol">%</span>
            </div>
            <div v-if="!loading" class="description">
                <span v-if="amountPlanningFilter==='total'">{{ formattedBudgetStart }} ~ {{ formattedBudgetEnd }}(MTD)</span>
                <span v-else>{{ thisMonth }} (MTD)</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';
import { BudgetData } from '@/services/billing/cost-management/budget/type';
import { forEach } from 'lodash';
import { commaFormatter } from '@spaceone/console-core-lib';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Period } from '@/services/billing/cost-management/type';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

interface Props {
    budgets: BudgetData[];
    loading: boolean;
}

export default {
    name: 'BudgetStat',
    props: {
        budgets: {
            type: Array,
            default: () => ([]),
        },
        loading: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: Props) {
        const { i18nDayjs } = useI18nDayjs();
        const state = reactive({
            amountPlanningFilter: 'total' as 'total' || 'thisMonth',
            noBudgets: computed<boolean>(() => props.budgets?.length === 0),
            totalCost: computed<number|undefined>(() => {
                if (state.noBudgets) return undefined;
                let totalUsage = 0;
                forEach(props.budgets, (budget) => { totalUsage += budget.total_usage_usd_cost; });
                return totalUsage / props.budgets?.length;
            }),
            totalBudget: computed<number|undefined>(() => {
                if (state.noBudgets) return undefined;
                let totalBudget = 0;
                forEach(props.budgets, (budget) => { totalBudget += budget.limit; });
                return totalBudget / props.budgets?.length;
            }),
            budgetUsage: computed<number>(() => (state.totalCost / state.totalBudget) * 100),
            budgetPeriod: computed<Period>(() => {
                let totalStart: Dayjs|undefined;
                let totalEnd: Dayjs|undefined;
                forEach(props.budgets, (budget) => {
                    const { start, end } = budget;
                    if (!totalStart || !totalEnd) [totalStart, totalEnd] = [dayjs(start), dayjs(end)];
                    const [dayjsStart, dayjsEnd] = [dayjs(start), dayjs(end)];
                    totalStart = totalStart.isBefore(dayjsStart) ? totalStart : dayjsStart;
                    totalEnd = totalEnd.isAfter(dayjsEnd) ? totalEnd : dayjsEnd;
                });
                return { start: totalStart?.toISOString(), end: totalEnd?.toISOString() };
            }),
            availableBudget: computed<number>(() => {
                const availableBudget = state.totalBudget - state.totalCost;
                return (availableBudget > 0 ? availableBudget : 0);
            }),
            thisMonth: computed(() => i18nDayjs.value().format('MMMM, YYYY')),
            formattedBudgetStart: computed(() => i18nDayjs.value(state.budgetPeriod.start).format('MMMM, YYYY')),
            formattedBudgetEnd: computed(() => i18nDayjs.value(state.budgetPeriod.end).format('MMMM, YYYY')),
        });


        return {
            ...toRefs(state),
            commaFormatter,
            currencyMoneyFormatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-stat {
    @apply border border-gray-200 rounded-lg border-solid box-border bg-white flex;
    .card-box {
        @apply flex flex-wrap flex-col justify-center gap-1;
        width: 100%;
        padding: 1.125rem 0;
        text-align: center;

        .symbol {
            @apply font-bold text-lg;
        }
        .title {
            @apply text-gray-700 text-sm;
            line-height: 1.3125rem;
        }
        .stat {
            @apply text-2xl font-bold flex justify-center;
            line-height: 1.75rem;
        }
        .description {
            @apply text-xs text-gray-400;
            line-height: 1.125rem;
        }

        &:first-child {
            @apply border-r border-gray-200;
        }

        &:last-child {
            @apply border-l border-gray-200;
        }
    }

    @screen mobile {
        @apply flex flex-col;
        .card-box {
            &:first-child {
                @apply border-b border-gray-200;
                border-right: 0;
            }
            &:last-child {
                @apply border-t border-gray-200;
                border-left: 0;
            }
        }
    }
}
</style>
