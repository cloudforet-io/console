<template>
    <cost-dashboard-simple-card-widget
        :title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.MONTH_TO_DATE_SPEND')"
        unit-type="CURRENCY"
        :loading="loading"
        :value="currencyMoneyFormatter(currentMonthCost, currency, currencyRates, true, 10000000000)"
        :currency-symbol="currencySymbol"
        :description="`${currentMonth.startOf('month').format('MMM DD')} ~ ${thisDay}, ${currentMonth.format('YYYY')}`"
        :no-data="!currentMonthCost || !lastMonthCost"
    >
        <template #default>
            <div class="cost-trend-wrapper flex">
                <span class="increase increase-rate" :class="[{safe: increaseRate < 0}, {alert: increaseRate > 0}]">
                    <p-i v-if="increaseRate < 0" name="ic_arrow-down" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up" width="1rem"
                         height="1rem"
                    />
                    {{ increaseRate }}%
                </span>
                <span class="increase increase-amount">
                    <p-i v-if="increaseCost < 0" name="ic_arrow-down" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up" width="1rem"
                         height="1rem"
                    />
                    <span class="unit">{{ currencySymbol }} </span>
                    <span>{{ currencyMoneyFormatter(Math.abs(increaseCost), currency, currencyRates, true, 10000000) }}</span>
                </span>
            </div>
            <span class="range">
                <template v-if="increaseRate < 0">
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.DECREASE') }}
                </template>
                <template v-else>
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.INCREASE') }}
                </template>
                {{ `${lastMonth.startOf('month').format('MMM DD')} ~ ${thisDay}, ${lastMonth.format('YYYY')}` }}
            </span>
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">
import dayjs, { Dayjs } from 'dayjs';

import CostDashboardSimpleCardWidget from '@/services/billing/cost-management/widgets/modules/CostDashboardSimpleCardWidget.vue';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { PI } from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';

const thisDay = dayjs.utc().format('DD');
export default {
    name: 'MonthToDateSpend',
    components: {
        CostDashboardSimpleCardWidget,
        PI,
    },
    props: {
        period: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
            validator(value: CURRENCY) {
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
    },
    setup(props: WidgetProps) {
        const state = reactive({
            loading: true,
            currentMonthCost: 0,
            lastMonthCost: 0,
            increaseCost: computed(() => state.currentMonthCost - state.lastMonthCost),
            increaseRate: computed(() => Math.round((state.currentMonthCost / state.lastMonthCost) * 100) - 100),
            currentMonth: computed<Dayjs>(() => dayjs.utc(props.period?.end)),
            lastMonth: computed<Dayjs>(() => dayjs.utc(props.period?.end).subtract(1, 'month')),
            currencySymbol: computed(() => CURRENCY_SYMBOL[props.currency]),
        });

        const costQueryHelper = new QueryHelper();
        const getData = async (start: Dayjs, end: Dayjs|string) => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            try {
                state.loading = true;
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
            } finally {
                state.loading = false;
            }
        };

        const getCurrentMonthChartData = async () => {
            const start = state.currentMonth.startOf('month').format('YYYY-MM-DD');
            const end = `${state.currentMonth.endOf('month').format('YYYY-MM')}-${thisDay}`;
            state.currentMonthCost = await getData(start, end);
        };

        const getLastMonthChartData = async () => {
            const start = state.lastMonth.startOf('month').format('YYYY-MM-DD');
            const end = `${state.lastMonth.endOf('month').format('YYYY-MM')}-${thisDay}`;
            state.lastMonthCost = await getData(start, end);
        };

        const getChartData = async () => {
            await Promise.allSettled([getCurrentMonthChartData(), getLastMonthChartData()]);
        };

        watch([() => props.period, () => props.filters], async (after) => {
            if (after) await getChartData();
        });

        getChartData();

        return {
            ...toRefs(state),
            currencyMoneyFormatter,
            thisDay,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-trend-wrapper {
    @apply flex;
    .increase {
        @apply flex items-center;
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
    @apply text-gray-500;
    font-size: 0.875rem;
    line-height: 150%;
}
</style>
