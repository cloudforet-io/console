<template>
    <widget-frame v-bind="widgetFrameProps"
                  :error-mode="false"
                  :no-height-limit="true"
                  @refresh="handleRefresh"
    >
        <div class="budget-usage-summary">
            <div class="budget">
                <p class="budget-label">
                    {{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.TOTAL_SPENT') }}
                </p>
                <div class="budget-value">
                    {{ currencyMoneyFormatter(state.totalSpent, state.options.currency) }}
                </div>
                <div class="budget-info">
                    {{ state.budgetCount }} {{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.BUDGETS') }}
                </div>
            </div>
            <div class="budget">
                <p class="budget-label">
                    {{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.TOTAL_BUDGET') }}
                </p>
                <div class="budget-value">
                    {{ currencyMoneyFormatter(state.totalBudget, state.options.currency) }}
                </div>
                <div class="budget-info">
                    {{ currencyMoneyFormatter(state.leftBudget, state.options.currency) }} {{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.AVAILABLE') }}
                </div>
            </div>
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.data"
                               loader-type="skeleton"
                               show-data-from-scratch
                >
                    <div ref="chartContext"
                         class="chart"
                    >
                        <span class="budget-usage">{{ state.spentBudgetRate }}%</span>
                    </div>
                </p-data-loader>
            </div>
        </div>
    </widget-frame>
</template>

<script setup lang="ts">

import type { ComputedRef } from 'vue';
import {
    computed, defineExpose,
    defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { color } from '@amcharts/amcharts5';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import type { createPieChart } from '@/common/composables/amcharts5/pie-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


interface Data {
    budget_type: string;
    budget_count: number;
    limit: number;
    usd_cost: number;
    usage: number;
    pieSettings?: {
        fill: ReturnType<typeof color>
    }
}

const DATE_FORMAT = 'YYYY-MM';

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const {
    createDonutChart, createPieSeries,
    disposeRoot, refreshRoot, setChartColors,
} = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    chart: null as null|ReturnType<typeof createPieChart>,
    series: null as null|ReturnType<typeof createPieSeries>,
    chartData: computed(() => {
        if (!state.data) return [];

        const results = [
            {
                budget_type: 'spent_budget',
                budget_rate: state.chartSpentBudgetRate,
            },
            {
                budget_type: 'left_budget',
                budget_rate: (100 - state.chartSpentBudgetRate),
                pieSettings: {
                    fill: color(gray[400]),
                },
            },
        ];

        return results;
    }),
    dateRange: computed<DateRange>(() => {
        const end = state.settings?.date_range?.end ?? dayjs.utc().format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    totalBudget: computed(() => {
        if (!state.data) return '--';
        return state.data[0].total_budget;
    }),
    totalSpent: computed(() => {
        if (!state.data) return '--';
        return state.data[0].total_spent;
    }),
    spentBudgetRate: computed(() => {
        let totalBudget = state.totalBudget;
        if (totalBudget === 0) totalBudget = 1;
        const budgetRate = (state.totalSpent / totalBudget) * 100;

        return (budgetRate.toFixed(2));
    }),
    chartSpentBudgetRate: computed(() => {
        let chartSpentBudgetRate = state.spentBudgetRate;
        if (chartSpentBudgetRate > 100) chartSpentBudgetRate = 100;

        return chartSpentBudgetRate;
    }),
    leftBudget: computed(() => {
        if (!state.data) return '--';

        return state.totalBudget - state.totalSpent;
    }),
    budgetCount: computed(() => {
        if (!state.data) return '--';

        return state.data[0].budget_count;
    }),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<Data[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            query: {
                granularity: state.options.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    total_spent: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                    total_budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                    budget_count: {
                        operator: 'count',
                    },
                },
            },
        });
        console.log(results);
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Util */
const drawChart = (chartData) => {
    const chart = createDonutChart();
    const seriesSettings = {
        categoryField: 'budget_type',
        valueField: 'budget_rate',
    };
    const series = createPieSeries(seriesSettings);
    chart.series.push(series);
    setChartColors(chart, state.colorSet);

    series.labels.template.set('forceHidden', true);
    series.ticks.template.set('visible', false);
    series.slices.template.setAll({
        toggleKey: 'none',
        forceInactive: true,
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });

    series.data.setAll(chartData);
    state.chart = chart;
    state.series = series;
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data[]> => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const handleRefresh = () => {
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: disposeRoot,
});

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>
<style lang="postcss" scoped>
.budget-usage-summary {
    padding: 0 1.5rem;
    .full & {
        @apply block;
    }
    .budget {
        @apply flex flex-col row-gap-1 text-gray-900;
        line-height: 1.25;
        margin-bottom: 1rem;
        .budget-label {
            font-size: 1rem;
        }
        .budget-value {
            margin: 0.25rem 0;
            font-size: 1.5rem;
        }
        .budget-info {
            @apply text-gray-700 font-medium;
        }
    }
    .budget-usage {
        @apply absolute;
        left: 50%;
        top: 50%;
        z-index: 10;
        transform: translate3d(-50%, -50%, 0);
    }
}
.chart-wrapper {
    @apply relative;
    width: 9rem;
    height: 9rem;
    .chart {
        height: 100%;
    }
}
.chart-loader {
    height: 100%;
}

@screen desktop {
    .full {
        .budget-usage-summary {
            @apply flex justify-between;
        }
    }
}

@screen laptop {
    .full {
        &.no-height-limit {
            min-height: 29rem;
        }
        .budget-usage-summary {
            @apply block;
        }
    }
}
</style>
