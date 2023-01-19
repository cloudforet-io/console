<template>
    <widget-frame v-bind="widgetFrameProps"
                  no-height-limit
                  @refresh="handleRefresh"
    >
        <div class="budget-usage-summary">
            <div class="data-container">
                <div class="budget">
                    <p class="budget-label">
                        {{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.TOTAL_SPENT') }}
                    </p>
                    <p-data-loader class="data-loader"
                                   :loading="state.loading"
                                   :data="state.data"
                                   :loader-backdrop-opacity="1"
                                   disable-empty-case
                                   loader-type="skeleton"
                    >
                        <div class="budget-value">
                            {{ currencyMoneyFormatter(state.totalSpent, state.currency) }}
                        </div>
                        <div class="budget-info">
                            {{ state.budgetCount }} {{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.BUDGETS') }}
                        </div>
                        <template #loader>
                            <div class="skeleton-wrapper">
                                <p-skeleton class="skeleton"
                                            width="10rem"
                                            height="1.875rem"
                                />
                                <p-skeleton class="skeleton"
                                            width="7.5rem"
                                            height="1.5rem"
                                />
                            </div>
                        </template>
                    </p-data-loader>
                </div>
                <div class="budget">
                    <p class="budget-label">
                        {{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.TOTAL_BUDGET') }}
                    </p>
                    <p-data-loader class="data-loader"
                                   :loading="state.loading"
                                   :data="state.data"
                                   :loader-backdrop-opacity="1"
                                   disable-empty-case
                                   loader-type="skeleton"
                    >
                        <div class="budget-value">
                            {{ currencyMoneyFormatter(state.totalBudget, state.currency) }}
                        </div>
                        <div class="budget-info">
                            {{ state.leftBudget }}
                        </div>
                        <template #loader>
                            <div class="skeleton-wrapper">
                                <p-skeleton class="skeleton"
                                            width="10rem"
                                            height="1.875rem"
                                />
                                <p-skeleton class="skeleton"
                                            width="7.5rem"
                                            height="1.5rem"
                                />
                            </div>
                        </template>
                    </p-data-loader>
                </div>
                <div class="chart-wrapper">
                    <p-data-loader class="data-loader"
                                   :loading="state.loading"
                                   :data="state.data"
                                   :loader-backdrop-opacity="1"
                                   disable-empty-case
                                   loader-type="skeleton"
                    >
                        <div ref="chartContext"
                             class="chart"
                        >
                            <span class="budget-usage">
                                <template v-if="Number.isNaN(state.spentBudget.rate)">
                                    -- %
                                </template>
                                <template v-else>
                                    {{ state.spentBudget.rate.toFixed(2) }}%{{ state.spentBudget.isOver ? '+' : '' }}
                                </template>
                            </span>
                        </div>
                    </p-data-loader>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose,
    defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';

import { color } from '@amcharts/amcharts5';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import type { createPieChart } from '@/common/composables/amcharts5/pie-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
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

interface ChartData {
    budget_type: string;
    budget_rate: number;
    pieSettings?: {
        fill: string
    }
}

const DATE_FORMAT = 'YYYY-MM';

const props = defineProps<WidgetProps>();
const chartContext = ref<HTMLElement|null>(null);
const {
    createDonutChart, createPieSeries,
    disposeRoot, refreshRoot, setChartColors, root,
} = useAmcharts5(chartContext);
const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    skeletons: [1, 2],
    chart: null as null|ReturnType<typeof createPieChart>,
    series: null as null|ReturnType<typeof createPieSeries>,
    chartData: computed<ChartData[]>(() => {
        if (!state.data) return [];

        let chartSpentBudgetRate = state.spentBudget.rate;
        if (chartSpentBudgetRate > 100) chartSpentBudgetRate = 100;

        const results = [
            {
                budget_type: 'spent_budget',
                budget_rate: chartSpentBudgetRate,
            },
            {
                budget_type: 'left_budget',
                budget_rate: (100 - chartSpentBudgetRate),
                pieSettings: {
                    fill: color(gray[400]),
                },
            },
        ];

        return results;
    }),
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
    totalBudget: computed(() => {
        if (!state.data?.length) return '--';
        return state.data[0].total_budget;
    }),
    totalSpent: computed(() => {
        if (!state.data?.length) return '--';
        return state.data[0].total_spent;
    }),
    spentBudget: computed(() => {
        let isOver = false;
        let totalBudget = state.totalBudget;
        if (totalBudget === 0) totalBudget = 1;

        let rate = (state.totalSpent / totalBudget) * 100;
        if (rate > 9999.99) {
            rate = 9999.99;
            isOver = true;
        }

        return { rate, isOver };
    }),
    leftBudget: computed(() => {
        if (!state.data?.length) return '--';
        const value = state.totalBudget - state.totalSpent;
        return `${currencyMoneyFormatter(value, state.currency)} ${i18n.t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.AVAILABLE')}`;
    }),
    budgetCount: computed(() => {
        if (!state.data?.length) return '--';
        return state.data[0].budget_count;
    }),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<Data[]> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.budgetConsoleFilters);
        const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
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
                ...apiQueryHelper.data,
            },
        });
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Util */
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.chartData?.length ?? 0),
});
const drawChart = (chartData) => {
    const chart = createDonutChart();
    const seriesSettings = {
        categoryField: 'budget_type',
        valueField: 'budget_rate',
    };
    const series = createPieSeries(seriesSettings);
    chart.series.push(series);
    setChartColors(chart, colorSet.value);

    series.labels.template.set('forceHidden', true);
    series.ticks.template.set('visible', false);
    series.slices.template.setAll({
        toggleKey: 'none',
        forceInactive: true,
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });

    if (chartData.some((d) => d[seriesSettings.valueField] && d[seriesSettings.valueField] > 0)) {
        series.data.setAll(chartData);
    } else {
        series.data.setAll([{
            [seriesSettings.valueField]: 1,
        }]);
        series.slices.template.setAll({
            fill: color(gray[200]),
            strokeOpacity: 0,
            forceInactive: true,
        });
    }

    state.chart = chart;
    state.series = series;
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data[]> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    refreshRoot();
    await nextTick();
    if (root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const handleRefresh = () => {
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: disposeRoot,
    refreshWidget,
    props,
});

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>
<style lang="postcss" scoped>
.budget-usage-summary {
    height: 100%;
    min-height: 10rem;
    .budget {
        @apply flex flex-col row-gap-1 text-gray-900;
        line-height: 1.25;
        height: 94px;
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
        @apply inline-block absolute;
        left: 50%;
        top: 50%;
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
.data-loader {
    display: flex;
    width: 100%;
    height: 100%;
    .skeleton-wrapper {
        width: 100%;
        height: 100%;
        .skeleton {
            display: block;
            margin-top: 0.25rem;
        }
    }
}
.full {
    @screen desktop {
        .budget-usage-summary {
            .data-container {
                @apply flex justify-between;
            }
            .budget {
                width: 30%;
            }
        }
        .skeleton-container {
            @apply flex flex-row justify-between;
            .skeleton-wrapper {
                margin-top: 0;
            }
        }
    }
}
</style>
