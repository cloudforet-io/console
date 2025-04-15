<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive, ref, toRef, watch,
} from 'vue';

import type { AxisRenderer, DateAxis } from '@amcharts/amcharts5/xy';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDivider, PDataLoader, PI, PSkeleton,
} from '@cloudforet/mirinae';

import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';

import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { CurrencySymbol } from '@/store/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { useDateRangeFormatter } from '@/common/composables/date-range-formatter';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red, gray } from '@/styles/colors';

import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetColorSet } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { getRefinedXYChartData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-data-helper';
import { getDateAxisSettings } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-helper';
import { getRefinedDateTableData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-table-helper';
import type {
    WidgetExpose, WidgetProps, WidgetEmit, CostAnalyzeResponse,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';


const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';
const VALUE_FIELD_NAME = 'value';
const STROKE_FIELD_NAME = 'strokeSettings';
const CHART_XAXIS_CHANGE_THRESHOLD_WIDTH = 370;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

interface SubData {
    date: string;
    value: number;
}
interface Data {
    value_sum: SubData[];
    _total_value_sum: number;
}
type FullData = CostAnalyzeResponse<Data>;
interface ChartData {
    date: string;
    value: number;
}

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.dashboardOptions?.date_range?.end).format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    widgetLocation: undefined,
});
const state = reactive({
    loading: true,
    data: null as Data[]|null,
    chartData: computed<ChartData[]>(() => {
        if (!state.data) return [];

        const dateFilledData = getRefinedDateTableData<Data>(state.data, widgetState.dateRange);

        const chartData = getRefinedXYChartData<Data, ChartData>(dateFilledData, {
            arrayDataKey: 'value_sum',
            categoryKey: DATE_FIELD_NAME,
            valueKey: VALUE_FIELD_NAME,
        });

        // set stroke settings only for current month data. This settings must be on chart data. This cannot be set at drawChart.
        const lastData = chartData[chartData.length - 1];
        const lastPreviousData = chartData[chartData.length - 2];
        if (lastPreviousData && lastData.date === dateState.today) {
            lastPreviousData[STROKE_FIELD_NAME] = {
                stroke: chartHelper.color(gray[400]),
                strokeDasharray: [3, 3],
            };
        }

        return chartData;
    }),
    noData: computed<boolean>(() => !state.data?.length),
});

const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: 1,
});

const dateState = reactive({
    today: computed<string>(() => (dayjs.utc().format(DATE_FORMAT))),
    selectedMonth: computed<Dayjs>(() => (dayjs.utc(widgetState.dateRange.end))),
    previousMonth: computed<Dayjs>(() => (dayjs.utc(widgetState.dateRange.end).subtract(1, 'month'))),
});
const [formattedCurrentMonth] = useDateRangeFormatter({
    end: computed(() => dayjs.utc(dateState.selectedMonth).format('YYYY-MM')),
    showTildeIfEndThisMonth: true,
});
const [formattedPreviousMonth] = useDateRangeFormatter({
    end: computed(() => dayjs.utc(widgetState.dateRange.end).subtract(1, 'month').format(DATE_FORMAT)),
});

const displayState = reactive({
    costOfCurrentMonth: computed<number>(() => getCostOfMonth(dateState.selectedMonth)),
    costOfPreviousMonth: computed<number>(() => getCostOfMonth(dateState.previousMonth)),
    costDiff: computed<number>(() => displayState.costOfCurrentMonth - displayState.costOfPreviousMonth),
    costDiffRate: computed<string>(() => {
        let costOfPreviousMonth = displayState.costOfPreviousMonth;
        if (displayState.costOfCurrentMonth === 0) costOfPreviousMonth = 1;
        return `${(Math.abs(displayState.costDiff) / costOfPreviousMonth * 100).toFixed(2)}%`;
    }),
    isDecreased: computed<boolean|undefined>(() => {
        if (displayState.costDiff === 0) return undefined;
        return displayState.costDiff < 0;
    }),
    diffColor: computed<string>(() => {
        if (displayState.isDecreased === undefined) return gray[600];
        return displayState.isDecreased ? green[600] : red[500];
    }),
    currencySymbol: computed<CurrencySymbol>(() => (widgetState.currency ? CURRENCY_SYMBOL[widgetState.currency] : CURRENCY_SYMBOL.USD)),
    chartXAxis: undefined as undefined|DateAxis<AxisRenderer>,
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<object, FullData>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Data[]|null> => {
    apiQueryHelper.setFilters(widgetState.consoleFilters);
    try {
        const { status, response } = await fetchCostAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.options.granularity,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    value_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return response.results;
        }
        return state.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

/* Util */
const getCostOfMonth = (month: Dayjs): number => {
    if (!state.data?.[0]?.value_sum?.length) return 0;
    const monthlyCost = state.data[0].value_sum.find((costData) => costData.date === month.format(DATE_FORMAT))?.value || 0;
    return monthlyCost;
};

const drawChart = (chartData: ChartData[]) => {
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));

    // set chart colors
    chartHelper.setChartColors(chart, colorSet.value);

    // set x-axis
    xAxis.get('baseInterval').timeUnit = 'month';
    const xRenderer = xAxis.get('renderer');
    xRenderer.grid.template.setAll({ strokeOpacity: 0.8, location: 0.5 });
    xRenderer.labels.template.setAll({
        visible: true,
        maxWidth: 25,
    });

    // set y-axis
    const yRenderer = yAxis.get('renderer');
    yRenderer.grid.template.setAll({ strokeOpacity: 0.8 });
    yRenderer.labels.template.setAll({ visible: true });

    // create line series
    const series = chartHelper.createXYLineSeries(chart, {
        xAxis,
        yAxis,
        valueXField: DATE_FIELD_NAME,
        valueYField: VALUE_FIELD_NAME,
    });

    // set series to chart
    chart.series.push(series);

    // set chart padding
    chart.setAll({
        paddingTop: 10,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
    });

    // set data processor to series
    series.data.processor = chartHelper.createDataProcessor({
        dateFormat: DATE_FORMAT,
        emptyAs: 0,
    });

    // set data to series
    series.data.setAll(chartData);

    // create tooltip
    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip, widgetState.currency);

    // set tooltip to series
    series.set('tooltip', tooltip);

    // set series style
    series.fills.template.setAll({
        fillOpacity: 0.3,
        visible: true,
    });
    series.fills.template.set('fillGradient', chartHelper.createLinearGradient({
        stops: [{
            opacity: 0.3,
        }, {
            opacity: 0,
        }],
    }));
    series.strokes.template.setAll({
        strokeWidth: 2,
        templateField: STROKE_FIELD_NAME,
    });

    // set bullets to series
    series.bullets.clear(); // clear default bullets
    series.bullets.push((root, _series, dataItem) => {
        const data = dataItem.dataContext as ChartData;
        const isCurrentMonth = dayjs(data.date).format(DATE_FORMAT) === dateState.today;
        return chartHelper.createBullet({
            sprite: chartHelper.createCircle({
                radius: 3,
                fill: isCurrentMonth ? chartHelper.color(gray[400]) : series.get('fill'),
            }),
        });
    });

    // for responsive design
    displayState.chartXAxis = xAxis;
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    chartHelper.refreshRoot();
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
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

watch(() => props.width, (_width) => {
    if (!displayState.chartXAxis) return;
    if (_width && (_width < CHART_XAXIS_CHANGE_THRESHOLD_WIDTH)) {
        displayState.chartXAxis.get('dateFormats').month = 'M';
    } else {
        displayState.chartXAxis.get('dateFormats').month = 'MMM';
    }
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="monthly-cost">
            <div class="current-month-cost-wrapper">
                <p class="cost-label">
                    {{ $t('DASHBOARDS.WIDGET.MONTHLY_COST.SELECTED_MONTH') }}
                    <strong>({{ formattedCurrentMonth }})</strong>
                </p>
                <p-data-loader class="data-loader"
                               :loading="props.loading || state.loading"
                               :data="!state.noData"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div class="current-month-cost">
                        <span class="currency-symbol">{{ displayState.currencySymbol }}</span>
                        {{ currencyMoneyFormatter(displayState.costOfCurrentMonth, { currency: widgetState.currency, style: 'decimal' }) }}
                    </div>
                    <div class="cost-diff"
                         :style="{color: displayState.diffColor}"
                    >
                        <p-i v-if="displayState.isDecreased !== undefined"
                             :name="displayState.isDecreased ? 'ic_caret-down-filled-alt' : 'ic_caret-up-filled-alt'"
                             fill
                             width="1rem"
                             height="1rem"
                             color="inherit"
                             original
                        />
                        <strong>{{ currencyMoneyFormatter(displayState.costDiff, { currency: widgetState.currency }) }}</strong>
                        <span class="cost-diff-rate">({{ displayState.costDiffRate }})</span>
                    </div>
                    <template #loader>
                        <div class="skeleton-wrapper">
                            <p-skeleton class="skeleton"
                                        width="10rem"
                                        height="2.5rem"
                            />
                            <p-skeleton class="skeleton"
                                        width="7.5rem"
                                        height="1.25rem"
                            />
                        </div>
                    </template>
                </p-data-loader>
            </div>
            <p-divider />
            <div class="previous-month-cost-wrapper">
                <p class="cost-label">
                    {{ $t('DASHBOARDS.WIDGET.MONTHLY_COST.PREVIOUS_MONTH') }}
                    <strong>({{ formattedPreviousMonth }})</strong>
                </p>
                <p-data-loader class="data-loader"
                               :loading="props.loading || state.loading"
                               :data="!state.noData"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div class="previous-month-cost">
                        <span class="currency-symbol">{{ displayState.currencySymbol }}</span>
                        {{ currencyMoneyFormatter(displayState.costOfPreviousMonth, { currency: widgetState.currency, style: 'decimal' }) }}
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
                               :loading="props.loading || state.loading"
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
.monthly-cost {
    display: flex;
    flex-direction: column;
    height: 100%;
    .cost-label {
        @apply text-label-lg font-normal text-gray-600;
        margin-bottom: 0.25rem;
    }
    .current-month-cost-wrapper {
        min-height: 6rem;
        .current-month-cost {
            @apply text-display-lg font-bold;
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            .currency-symbol {
                @apply text-display-sm font-normal text-gray-600;
                margin-right: 1px;
            }
        }
        .cost-diff {
            @apply text-label-lg;
            display: flex;
            align-items: center;
            .cost-diff-rate {
                margin-left: 0.5rem;
            }
        }
    }

    .previous-month-cost-wrapper {
        min-height: 3.5rem;
        .previous-month-cost {
            @apply text-display-md font-normal;
            display: flex;
            align-items: center;
            .currency-symbol {
                @apply text-label-xl font-normal;
                margin-right: 1px;
            }
        }
    }

    .p-divider {
        display: block;
        margin: 1rem 0;
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
                margin-bottom: 0.5rem;
            }
        }
    }
}
</style>
