<script setup lang="ts">
import {
    computed, defineExpose,
    defineProps, nextTick, reactive, ref,
} from 'vue';

import { PDataLoader, PSkeleton, PProgressBar } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { CurrencySymbol } from '@/store/modules/settings/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { useDateRangeFormatter } from '@/common/composables/date-range-formatter';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo, red, gray } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type { WidgetExpose, WidgetProps, WidgetEmit } from '@/services/dashboards/widgets/_configs/config';
import { getDateAxisSettings, getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';

interface SubData {
    date: string;
    value: number;
}
interface Data {
    spent: SubData[];
    budget: SubData[];
    _total_spent: number;
    _total_budget: number;
    budget_count: number;
}

interface ChartData {
    date: string;
    spent: number;
    budget: number;
}

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.settings?.date_range?.end).format('YYYY-MM');
        const start = dayjs.utc(end).subtract(11, 'month').format('YYYY-MM');
        return { start, end };
    }),
});
const state = reactive({
    loading: true,
    data: null as null|Data[],
    chartData: computed<ChartData[]>(() => {
        const data = state.data?.[0];
        if (!data) return [];
        return getRefinedXYChartData(state.data, {
            arrayDataKey: ['spent', 'budget'],
            categoryKey: 'date',
            valueKey: 'value',
            useDataKeyAsRefinedValue: true,
        });
    }),
    //
    noData: computed<boolean>(() => !state.data?.length),
    recentSpentData: computed<SubData|undefined>(() => {
        if (!state.data?.length) return undefined;
        const recent = state.data?.[0].spent[state.data[0].spent.length - 1];
        if (recent.date === widgetState.dateRange.end) return recent;
        return {
            date: widgetState.dateRange.end,
            value: 0,
        };
    }),
    recentBudgetData: computed<SubData|undefined>(() => {
        if (!state.data?.length) return undefined;
        const recent = state.data[0].budget[state.data[0].budget.length - 1];
        if (recent.date === widgetState.dateRange.end) return recent;
        return {
            date: widgetState.dateRange.end,
            value: 0,
        };
    }),
});

const displayState = reactive({
    recentSpent: computed<number>(() => {
        if (!state.recentSpentData) return 0;
        return state.recentSpentData.value;
    }),
    recentBudget: computed<number>(() => {
        if (!state.recentBudgetData) return 0;
        return state.recentBudgetData.value;
    }),
    recentBudgetLeft: computed<number>(() => {
        if (!state.recentSpentData || !state.recentBudgetData) return 0;
        return state.recentBudgetData.value - state.recentSpentData.value;
    }),
    isSpentOverBudget: computed<boolean>(() => {
        if (!state.recentSpentData || !state.recentBudgetData) return false;
        return state.recentSpentData.value > state.recentBudgetData.value;
    }),
    recentSpentRate: computed<number>(() => {
        if (!state.recentSpentData || !state.recentBudgetData) return 0;
        return (state.recentSpentData.value / state.recentBudgetData.value) * 100;
    }),
    budgetCount: computed<number>(() => state.data?.[0]?.budget_count ?? 0),
    currencySymbol: computed<CurrencySymbol>(() => (widgetState.currency ? CURRENCY_SYMBOL[widgetState.currency] : CURRENCY_SYMBOL.USD)),
});

const [recentSpentPeriod] = useDateRangeFormatter({
    start: computed(() => widgetState.dateRange.end),
    end: computed(() => widgetState.dateRange.end),
    showTildeIfStartAndEndThisMonth: true,
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchBudgetUsageAnalyze = getCancellableFetcher<{results: Data[]}>(SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        apiQueryHelper.setFilters(widgetState.budgetConsoleFilters);
        const { status, response } = await fetchBudgetUsageAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.options.granularity,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    spent: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    budget: {
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
        if (status === 'succeed') {
            return response.results;
        }
        return state.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const dataColor = (data: ChartData) => {
    if (data.spent > data.budget) return chartHelper.color(red[400]);
    return chartHelper.color(indigo[400]);
};
const drawChart = (chartData: ChartData[]) => {
    // create chart
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));

    // set chart padding
    chart.setAll({
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: -10,
    });

    // set axis
    xAxis.get('baseInterval').timeUnit = 'month';
    const yRendered = yAxis.get('renderer');
    yRendered.grid.template.setAll({ strokeOpacity: 0 });
    yRendered.labels.template.setAll({ visible: false });

    // create column series, line series
    const columnSeries = chartHelper.createXYColumnSeries(chart, {
        valueYField: 'spent',
    });
    const lineSeries = chartHelper.createXYLineSeries(chart, {
        valueYField: 'budget',
        stroke: chartHelper.color(gray[300]),
        maskBullets: false,
    });

    // set series to chart. do not move this to the bottom of this function.
    chart.series.push(columnSeries);
    chart.series.push(lineSeries);

    // set series default settings
    columnSeries.columns.template.setAll({
        strokeOpacity: 0,
        width: chartHelper.percent(35),
    });
    lineSeries.strokes.template.setAll({
        strokeWidth: 0.5,
        strokeDasharray: [10, 5],
    });

    // disable line series bullets
    lineSeries.bullets.setAll([]);

    // set columns color
    columnSeries.columns.template.adapters.add('fill', (fill, target) => {
        const data = target.dataItem?.dataContext as ChartData;
        if (!data) return chartHelper.color(indigo[400]);
        return dataColor(data);
    });

    // set tooltip to column series
    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip, widgetState.currency);
    tooltip.label.adapters.add('text', (_, target) => {
        const data = target.dataItem?.dataContext as ChartData;
        if (!data) return '';
        const spent = currencyMoneyFormatter(data.spent, widgetState.currency);
        const budget = currencyMoneyFormatter(data.budget, widgetState.currency);
        let text = `[${dataColor(data)};fontSize: 10px]●[/] {valueX}\n`;
        text += `spent: [bold]${spent}[/]\n`;
        text += `budget: [bold]${budget}[/]`;
        return text;
    });
    columnSeries.set('tooltip', tooltip);

    // set series data processor for date
    columnSeries.data.processor = chartHelper.createDataProcessor({
        dateFormat: 'YYYY-MM',
    });
    lineSeries.data.processor = chartHelper.createDataProcessor({
        dateFormat: 'YYYY-MM',
    });

    // set data to series
    columnSeries.data.setAll(chartData);
    lineSeries.data.setAll(chartData);
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data[]> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    emit,
    widgetState,
});

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  no-height-limit
                  v-on="widgetFrameEventHandlers"
    >
        <div class="budget-usage-summary">
            <div class="recent-budget-spent">
                <p-data-loader class="data-loader"
                               :loading="state.loading"
                               :data="!state.noData"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div class="row-wrapper">
                        <span class="spent-rate">{{ displayState.recentSpentRate === undefined ? '--' : displayState.recentSpentRate.toFixed(2) }}%</span>
                        <span class="budget-count">{{ $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.BUDGETED', { count: displayState.budgetCount }) }}</span>
                    </div>
                    <div class="row-wrapper">
                        <p-progress-bar :percentage="displayState.recentSpentRate"
                                        :color="displayState.isSpentOverBudget ? red[400] : indigo[300]"
                                        size="lg"
                                        height="1.5rem"
                        />
                    </div>
                    <div class="row-wrapper">
                        <span class="spent-cost">
                            <span class="currency-symbol">{{ displayState.currencySymbol }}</span>{{ currencyMoneyFormatter(displayState.recentSpent, undefined, undefined, true) }}
                        </span>
                        <i18n path="DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.OUT_OF"
                              class="recent-budget"
                        >
                            <template #value>
                                <span class="currency-symbol">{{ displayState.currencySymbol }}</span>
                                <span class="value">{{ currencyMoneyFormatter(displayState.recentBudget, undefined, undefined, true) }}</span>
                            </template>
                        </i18n>
                    </div>
                    <div class="row-wrapper">
                        <i18n path="DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.BUDGET_USAGE_IN"
                              class="period"
                        >
                            <template #period>
                                <strong>{{ recentSpentPeriod }}</strong>
                            </template>
                        </i18n>
                        <span class="budget-left">
                            ({{ displayState.isSpentOverBudget ?
                                $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.EXCEED', { value: currencyMoneyFormatter(displayState.recentBudgetLeft, widgetState.currency) }) :
                                $t('DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.LEFT', { value: currencyMoneyFormatter(displayState.recentBudgetLeft, widgetState.currency) })
                            }})
                        </span>
                    </div>
                    <template #loader>
                        <div class="skeleton-wrapper">
                            <p-skeleton class="skeleton"
                                        width="10rem"
                                        height="1.875rem"
                            />
                        </div>
                    </template>
                </p-data-loader>
            </div>
            <div class="chart-wrapper">
                <p-data-loader class="data-loader"
                               :loading="state.loading"
                               :data="!state.noData"
                               :loader-backdrop-opacity="1"
                               loader-type="skeleton"
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.budget-usage-summary {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.recent-budget-spent {
    min-height: 7.5rem;
    .row-wrapper {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    .spent-rate {
        @apply text-display-lg font-bold;
    }
    .budget-count {
        @apply text-label-lg font-normal;
    }
    .spent-cost {
        @apply text-display-md font-medium;
        .currency-symbol {
            @apply text-display-sm font-normal text-gray-600;
        }
    }
    .recent-budget {
        @apply text-label-lg font-normal text-gray-600;
        .currency-symbol {
            @apply text-label-xl font-normal text-gray-900;
        }
        .value {
            @apply text-display-md font-medium text-gray-900;
        }
    }
    .period {
        @apply text-label-lg font-normal text-gray-600;
    }
    .budget-left {
        @apply text-label-lg font-medium text-gray-600;
    }
}
.chart-wrapper {
    flex-grow: 1;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    width: 100%;
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
</style>
