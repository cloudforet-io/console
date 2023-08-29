<template>
    <div class="budget-stat">
        <div v-for="({title, data, unit, description}) in cards"
             :key="title"
             class="card-box"
        >
            <div class="title">
                <span>{{ title }}</span>
            </div>
            <div v-if="loading"
                 class="loader"
            />
            <template v-else>
                <div class="stat">
                    <template v-if="unit === UNIT.currency">
                        <span>{{ currencyMoneyFormatter(data, currency, currencyRates) }}</span>
                    </template>
                    <template v-else-if="unit === UNIT.percent">
                        <span>
                            <template v-if="data < 0">0.00</template>
                            <template v-else>{{ data.toFixed(2) }}</template>
                        </span>
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
    computed, defineComponent, getCurrentInstance,
    reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import { commaFormatter, isNotEmpty } from '@cloudforet/core-lib';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { BudgetUsageModel } from '@/services/cost-explorer/budget/model';
import type {
    BudgetUsageAnalyzeRequestParam,
    BudgetUsageRange,
} from '@/services/cost-explorer/budget/type';
import type { Period } from '@/services/cost-explorer/type';

interface Props {
    queryStoreFilters: ConsoleFilter[];
    period: Period;
    usageRange: BudgetUsageRange;
    printMode?: boolean;
}

const UNIT = Object.freeze({
    currency: 'currency',
    percent: 'percent',
} as const);
type Unit = typeof UNIT[keyof typeof UNIT];

interface Card {
    title: TranslateResult;
    data: number;
    unit: Unit;
}

export default defineComponent<Props>({
    name: 'BudgetStat',
    props: {
        queryStoreFilters: {
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
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const { i18nDayjs } = useI18nDayjs();
        const budgetUsageApiQueryHelper = new ApiQueryHelper();
        const state = reactive({
            budgetUsage: {} as BudgetUsageModel,
            loading: false,
            // currency
            currency: computed(() => store.state.settings.currency),
            currencyRates: computed(() => store.state.settings.currencyRates),
            currencySymbol: computed(() => store.getters['settings/currencySymbol']),
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

                const today = i18nDayjs.value.utc();
                const start = i18nDayjs.value.utc(props.period.start);
                const end = i18nDayjs.value.utc(props.period.end);

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

                const { filter, keyword } = budgetUsageApiQueryHelper.setFilters(props.queryStoreFilters).data;
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
        watch([() => props.queryStoreFilters, () => props.period, () => props.usageRange], async () => {
            await fetchBudgetUsage();
            await vm.$nextTick();
            emit('rendered');
        }, { immediate: true });

        return {
            ...toRefs(state),
            commaFormatter,
            currencyMoneyFormatter,
            UNIT,
        };
    },
});
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
            white-space: nowrap;
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
