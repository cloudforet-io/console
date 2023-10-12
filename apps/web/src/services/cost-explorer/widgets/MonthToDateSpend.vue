<template>
    <cost-dashboard-simple-card-widget
        :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.MONTH_TO_DATE_SPEND')"
        unit-type="CURRENCY"
        :loading="loading"
        :widget-link="widgetLink"
        :value="currencyMoneyFormatter(currentMonthCost, currency, currencyRates, true, 10000000000)"
        :currency-symbol="currencySymbol"
        :description="thisMonthFormatter(currentMonth)"
        :no-data="!loading && !currentMonthCost && !lastMonthCost"
        :class="{ 'print-mode': printMode }"
    >
        <template #default>
            <div class="cost-trend-wrapper flex">
                <span class="increase increase-rate"
                      :class="[{safe: increaseRate < 0}, {alert: increaseRate > 0}]"
                >
                    <p-i v-if="increaseRate < 0"
                         name="ic_arrow-down-bold"
                         width="1rem"
                         height="1rem"
                    />
                    <p-i v-else
                         name="ic_arrow-up-bold"
                         width="1rem"
                         height="1rem"
                    />
                    {{ increaseRate }}%
                </span>
                <span class="increase increase-amount">
                    <p-i v-if="increaseCost < 0"
                         name="ic_arrow-down-bold"
                         width="1rem"
                         height="1rem"
                    />
                    <p-i v-else
                         name="ic_arrow-up-bold"
                         width="1rem"
                         height="1rem"
                    />
                    <span class="unit">{{ currencySymbol }} </span>
                    <span>{{ currencyMoneyFormatter(Math.abs(increaseCost), currency, currencyRates, true, 10000000) }}</span>
                </span>
            </div>
            <span class="range">
                <template v-if="increaseRate < 0">
                    <span class="range"> {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.DECREASE', { date: thisMonthFormatter(lastMonth) }) }} </span>
                </template>
                <template v-else>
                    <span class="range"> {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.INCREASE', { date: thisMonthFormatter(lastMonth) }) }} </span>
                </template>
            </span>
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">

import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PI } from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import CostDashboardSimpleCardWidget from '@/services/cost-explorer/widgets/modules/CostDashboardSimpleCardWidget.vue';
import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

const thisDay = dayjs.utc().format('DD');
const thisMonth = dayjs.utc().format('MM');
export default defineComponent<WidgetProps>({
    name: 'MonthToDateSpend',
    components: {
        CostDashboardSimpleCardWidget,
        PI,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
            validator(value: Currency) {
                return Object.values(CURRENCY).includes(value);
            },
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: WidgetProps, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const checkThisMonth = () => dayjs.utc(props.period?.end).format('MM') === thisMonth;
        const thisMonthFormatter = (targetDate: Dayjs) => {
            if (checkThisMonth()) {
                return `${targetDate.startOf('month').format('MMM DD')} ~ ${thisDay}, ${targetDate.format('YYYY')}`;
            } return `${targetDate.startOf('month').format('MMM DD')} ~ ${targetDate.endOf('month').format('MMM DD')}, ${targetDate.format('YYYY')}`;
        };
        const state = reactive({
            loading: true,
            currentMonthCost: 0,
            lastMonthCost: 0,
            increaseCost: computed(() => state.currentMonthCost - state.lastMonthCost),
            increaseRate: computed(() => (state.lastMonthCost !== 0 ? Math.round(((state.currentMonthCost - state.lastMonthCost) / state.lastMonthCost) * 100)
                : Math.round(state.currentMonthCost))),
            currentMonth: computed<Dayjs>(() => dayjs.utc(props.period?.end)),
            lastMonth: computed<Dayjs>(() => dayjs.utc(props.period?.end).subtract(1, 'month')),
            currencySymbol: computed(() => CURRENCY_SYMBOL[props.currency]),
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        period: objectToQueryString({
                            start: state.currentMonth.startOf('month').format('YYYY-MM-DD'),
                            end: state.currentMonth.endOf('month').format('YYYY-MM-DD'),
                        }),
                    },
                };
            }),
        });

        const costQueryHelper = new QueryHelper();
        const getData = async (start: Dayjs, end: Dayjs|string) => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    start,
                    end,
                    ...costQueryHelper.apiQuery,
                });
                return results[0]?.usd_cost;
            } catch (e) {
                ErrorHandler.handleError(e);
                return undefined;
            }
        };

        const getCurrentMonthChartData = async () => {
            const start = state.currentMonth.format('YYYY-MM');
            const end = state.currentMonth.format('YYYY-MM');
            state.currentMonthCost = await getData(start, end) || 0;
        };

        const getLastMonthChartData = async () => {
            const start = state.lastMonth.format('YYYY-MM');
            let end = state.lastMonth.format('YYYY-MM');
            if (checkThisMonth()) {
                if (Number(thisDay) > state.lastMonth.daysInMonth()) {
                    end = state.lastMonth.endOf('month').format('YYYY-MM-DD');
                } else {
                    end = `${state.lastMonth.format('YYYY-MM')}-${thisDay}`;
                }
            }
            state.lastMonthCost = await getData(start, end) || 0;
        };

        const getChartData = async () => {
            state.loading = true;
            await Promise.allSettled([getCurrentMonthChartData(), getLastMonthChartData()]);
            state.loading = false;
        };

        watch([() => props.period, () => props.filters], async (after) => {
            if (after) {
                await getChartData();
                await vm.$nextTick();
                await getChartData();
                emit('rendered');
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            currencyMoneyFormatter,
            thisDay,
            checkThisMonth,
            thisMonthFormatter,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cost-trend-wrapper {
    @apply flex;
    .increase {
        @apply flex items-center;
        white-space: nowrap;
        font-size: 1.125rem;
        line-height: 155%;
        .p-i-icon {
            @apply relative;
            top: -0.1rem;
        }
        &-rate {
            flex-basis: 50%;
            margin-left: 0.125rem;
            &.safe {
                @apply text-safe;
            }
            &.alert {
                @apply text-alert;
            }
        }
        &-amount {
            @apply text-gray-800 font-bold;
            .unit {
                @apply font-normal;
                font-size: 1rem;
                line-height: 160%;
            }
        }
    }
}
.range {
    @apply text-gray-600;
    font-size: 0.875rem;
    line-height: 150%;
}
.print-mode {
    .increase {
        white-space: nowrap;
    }
}
</style>
