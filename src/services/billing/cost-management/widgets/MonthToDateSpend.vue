<template>
    <cost-dashboard-simple-card-widget
        title="Month-to-Date Spend"
        unit-type="CURRENCY"
        :loading="loading"
        :value="currencyMoneyFormatter(currentMonthCost, currency, currencyRates, false, true)"
        :currency-symbol="currencySymbol"
        :description="`${currentMonth.startOf('month').format('MMM DD')} ~ ${currentMonth.endOf('month').format('DD')}, ${currentMonth.format('YYYY')}`"
        :no-data="!currentMonthCost || !lastMonthCost"
    >
        <template #default>
            <div class="cost-trend-wrapper">
                <span class="increase-rate" :class="[{safe: increaseRate < 0}, {alert: increaseRate > 0}]">
                    <p-i v-if="increaseRate < 0" name="ic_arrow-down" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up" width="1rem"
                         height="1rem"
                    />
                    {{ increaseRate }}%
                </span>
                <span class="increase-amount">
                    <p-i v-if="increaseCost < 0" name="ic_arrow-down" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up" width="1rem"
                         height="1rem"
                    />
                    <span class="unit">{{ currencySymbol }} </span>
                    <span>{{ currencyMoneyFormatter(Math.abs(increaseCost), currency, currencyRates, true, true) }}</span>
                </span>
            </div>
            <div class="range">
                Decreased from {{ `${lastMonth.startOf('month').format('MMM DD')} ~ ${lastMonth.endOf('month').format('DD')}, ${lastMonth.format('YYYY')}` }}
            </div>
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">
import dayjs, { Dayjs } from 'dayjs';

import CostDashboardSimpleCardWidget from '@/services/billing/cost-management/widgets/modules/CostDashboardSimpleCardWidget.vue';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { PI } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';


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
    },
    setup(props: WidgetProps) {
        const state = reactive({
            loading: true,
            currentMonthCost: 0,
            lastMonthCost: 0,
            increaseCost: computed(() => state.currentMonthCost - state.lastMonthCost),
            increaseRate: computed(() => Math.round((state.currentMonthCost / state.lastMonthCost) * 100) - 100),
            currentMonth: computed<Dayjs>(() => dayjs.utc(props.period.end)),
            lastMonth: computed<Dayjs>(() => dayjs.utc(props.period.end).subtract(1, 'month')),
            currencySymbol: computed(() => CURRENCY_SYMBOL[props.currency]),
        });

        const getData = async (start: Dayjs, end: Dayjs) => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    start,
                    end,
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
            const start = state.currentMonth.startOf('month');
            const end = state.currentMonth.add(1, 'month').startOf('month');
            state.currentMonthCost = await getData(start, end);
        };

        const getLastMonthChartData = async () => {
            const start = state.lastMonth.startOf('month');
            const end = state.currentMonth.startOf('month');
            state.lastMonthCost = await getData(start, end);
        };

        (() => {
            Promise.allSettled([getCurrentMonthChartData(), getLastMonthChartData()]);
        })();

        return {
            ...toRefs(state),
            currencyMoneyFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.increase-rate {
    margin-left: 0.125rem;
    font-size: 1.125rem;
    line-height: 155%;
    &.safe {
        @apply text-safe;
    }
    &.alert {
        @apply text-alert;
    }
}
.cost-trend-wrapper {
    @apply flex;
    .increase-rate {
        flex-basis: 50%;
    }
}
.increase-amount {
    @apply text-gray-800 font-bold;
    font-size: 1.125rem;
    line-height: 155%;
    .unit {
        @apply font-normal;
        font-size: 1rem;
        line-height: 160%;
    }
}
.range {
    @apply text-gray-500;
    font-size: 0.875rem;
    line-height: 150%;
}

</style>
