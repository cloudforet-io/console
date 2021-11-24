<template>
    <card-widget-layout
        :title="'Month-to-Date Spend'"
        unit-type="CURRENCY"
        unit="USD"
        :value="currentMonthData"
        :description="`${formattedCurrentMonthData.start} ~ ${formattedCurrentMonthData.end}`"
    >
        <template #default>
            <div class="cost-trend-wrapper">
                <span class="rate" :class="[{safe: rate < 0}, {alert: rate > 0}]">
                    <p-i v-if="rate < 0" name="ic_arrow-down v1" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up v1" width="1rem"
                         height="1rem"
                    />
                    {{ rate }}%
                </span>
                <span class="cost">
                    <p-i v-if="cost < 0" name="ic_arrow-down v1" width="1rem"
                         height="1rem"
                    />
                    <p-i v-else name="ic_arrow-up v1" width="1rem"
                         height="1rem"
                    /><span class="unit">$</span> {{ cost.toFixed(2) }}
                </span>
            </div>
            <div class="range">
                Decreased from {{ formattedLastMonthData.start }} ~ {{ formattedLastMonthData.end }}
            </div>
        </template>
    </card-widget-layout>
</template>

<script lang="ts">
import dayjs, { Dayjs } from 'dayjs';

import CardWidgetLayout from '@/services/billing/cost-management/cost-dashboard/widgets/modules/CostDashboardSimpleCardWidget.vue';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { PI } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

interface Period {
    start: Dayjs | string;
    end: Dayjs | string;
}

const currentDay = dayjs().utc();

const currentMonthPeriod = {
    start: currentDay.startOf('month'),
    end: currentDay,
};

const lastMonthPeriod = {
    start: currentDay.subtract(1, 'month').startOf('month'),
    end: currentDay.subtract(1, 'month').endOf('month'),
};

export default {
    name: 'MonthToDateSpend',
    components: {
        CardWidgetLayout,
        PI,
    },

    setup() {
        const state = reactive({
            currentMonthData: 0,
            lastMonthData: 0,
            cost: computed(() => state.currentMonthData - state.lastMonthData),
            rate: computed(() => Math.round((state.currentMonthData / state.lastMonthData) * 100) - 100),
            formattedCurrentMonthData: computed<Period>(() => ({
                start: currentMonthPeriod.start.format('MM/DD'),
                end: currentMonthPeriod.end.format('MM/DD'),
            })),
            formattedLastMonthData: computed<Period>(() => ({
                start: lastMonthPeriod.start.format('MM/DD'),
                end: lastMonthPeriod.end.format('MM/DD'),
            })),
            loading: true,
        });

        const getChartData = async (period: {start: Dayjs; end: Dayjs}) => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    start: period.start,
                    end: period.end,
                });
                return results[0].usd_cost;
            } catch (e) {
                ErrorHandler.handleError(e);
                return 0;
            } finally {
                state.loading = false;
            }
        };

        const getCurrentMonthChartData = async () => {
            state.currentMonthData = await getChartData(currentMonthPeriod);
        };

        const getLastMothChartData = async () => {
            state.lastMonthData = await getChartData(lastMonthPeriod);
        };

        (() => {
            Promise.allSettled([getCurrentMonthChartData(), getLastMothChartData()]);
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.rate {
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
    .rate {
        flex-basis: 50%;
    }
}
.cost {
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
