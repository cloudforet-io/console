<template>
    <div class="budget-stat">
        <div v-for="({title, data, unit, description}) in cards" :key="title" class="card-box">
            <div class="title">
                <span>{{ title }}</span>
            </div>
            <div v-if="loading" class="loader" />
            <template v-else>
                <div class="stat">
                    <template v-if="unit === UNIT.currency">
                        <span class="symbol">{{ currencySymbol }}</span>
                        <span>{{ currencyMoneyFormatter(data, currency, currencyRates, true) }}</span>
                    </template>
                    <template v-else-if="unit === UNIT.percent">
                        <span>{{ data.toFixed(2) }}</span>
                        <span class="symbol">&nbsp;%</span>
                    </template>
                </div>
                <div class="description">
                    {{ description }}
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';

import { commaFormatter, isNotEmpty } from '@spaceone/console-core-lib';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import {
    BudgetUsageAnalyzeRequestParam,
    BudgetUsageData,
    BudgetUsageRange,
} from '@/services/billing/cost-management/budget/type';
import { Period } from '@/services/billing/cost-management/type';


interface Props {
    filters: QueryStoreFilter[];
    period: Period;
    usageRange: BudgetUsageRange;
}

interface Card {
    title: TranslateResult;
    data: number;
    unit: UNIT;
}

const UNIT = Object.freeze({
    currency: 'currency',
    percent: 'percent',
} as const);
type UNIT = typeof UNIT[keyof typeof UNIT]

export default {
    name: 'BudgetStat',
    props: {
        filters: {
            type: Array,
            default: () => ([]),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        usageRange: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props) {
        const { i18nDayjs } = useI18nDayjs();
        const budgetUsageApiQueryHelper = new ApiQueryHelper();
        const state = reactive({
            budgetUsage: {} as BudgetUsageData,
            loading: false,
            // currency
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            currencySymbol: computed(() => store.getters['display/currencySymbol']),
            // card data
            cards: computed<Card[]>(() => [
                // total cost
                {
                    title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.STAT.TOTAL_COST'),
                    data: state.budgetUsage.usd_cost ?? 0,
                    unit: UNIT.currency,
                    dataType: '',
                    description: state.formattedPeriod,
                },
                // total budget
                {
                    title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.STAT.TOTAL_BUDGET'),
                    data: state.budgetUsage.limit ?? 0,
                    unit: UNIT.currency,
                    description: state.availableBudget,
                },
                // budget usage
                {
                    title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.STAT.BUDGET_USAGE'),
                    data: state.budgetUsage.usage ?? 0,
                    unit: UNIT.percent,
                    description: state.formattedPeriod,
                },
            ]),
            formattedPeriod: computed<string>(() => {
                if (isEmpty(props.period)) return '';

                const today = i18nDayjs.value();
                const start = i18nDayjs.value(props.period.start);
                const end = i18nDayjs.value(props.period.end);

                const isStartFirstDateOfThisMonth = start.isSame(today, 'month') && start.isSame(1, 'date');
                const isEndToday = end.isSame(today, 'date');

                if (isStartFirstDateOfThisMonth && isEndToday) {
                    return `${today.format('MMM YYYY')} (MTD)`;
                }

                return `${start.format('MMM D, YYYY')} ~ ${end.format('MMM D, YYYY')}`;
            }),
            availableBudget: computed<string>(() => {
                let availableBudget = state.budgetUsage.limit - state.budgetUsage.usd_cost;
                availableBudget = availableBudget > 0 ? availableBudget : 0;

                return `${currencyMoneyFormatter(availableBudget, state.currency, state.currencyRates)} ${i18n.t('BILLING.COST_MANAGEMENT.BUDGET.STAT.AVAILABLE')}`;
            }),
            // api request params
            budgetUsageParam: computed<BudgetUsageAnalyzeRequestParam>(() => {
                const param: BudgetUsageAnalyzeRequestParam = {
                    include_budget_count: true,
                };

                const { filter, keyword } = budgetUsageApiQueryHelper.setFilters(props.filters).data;
                if (keyword) param.keyword = keyword;
                if (filter?.length) param.filter = filter;
                if (isNotEmpty(props.usageRange)) param.usage_range = props.usageRange;
                if (props.period.start) param.start = dayjs.utc(props.period.start).format('YYYY-MM');
                if (props.period.end) param.end = dayjs.utc(props.period.end).format('YYYY-MM');

                return param;
            }),
        });

        const fetchBudgetUsage = async () => {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze(state.budgetUsageParam);

                state.budgetUsage = results[0] ?? {};
            } catch (e) {
                ErrorHandler.handleError(e);
                state.budgetUsage = {};
            }
        };

        /* Watchers */
        watch([() => props.filters, () => props.period, () => props.usageRange], () => {
            fetchBudgetUsage();
        }, { immediate: true });


        return {
            ...toRefs(state),
            commaFormatter,
            currencyMoneyFormatter,
            UNIT,
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-stat {
    @apply flex rounded-lg border-solid box-border bg-white;
    margin-bottom: 1rem;
    .card-box {
        @apply border-gray-200 border-l;
        width: 33.33%;
        text-align: center;

        &:first-of-type {
            @apply border-l-0;
        }
        .symbol {
            @apply font-bold text-lg;
            align-self: center;
        }
        .title {
            @apply text-gray-700 text-sm;
            line-height: 1.5;
        }
        .stat {
            @apply text-2xl font-bold flex justify-center;
            padding: 0.25rem 0;
            line-height: 1.2;
        }
        .description {
            @apply text-xs text-gray-400;
            line-height: 1.5;
        }
    }

    @screen mobile {
        @apply flex flex-col items-center;
        padding: 0 0.75rem;
        .card-box {
            @apply flex flex-col justify-center border-t border-l-0;

            width: 100%;
            min-height: 6rem;

            &:first-of-type {
                @apply border-t-0;
            }
        }
    }
}
</style>
