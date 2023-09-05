<script setup lang="ts">
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDivider, PDataLoader, PBadge, PI, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { useDateRangeFormatter } from '@/common/composables/date-range-formatter';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type { WidgetExpose, WidgetProps, WidgetEmit } from '@/services/dashboards/widgets/_configs/config';
import { getDateAxisSettings, getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { XYChartData, CostAnalyzeDataModel } from '@/services/dashboards/widgets/type';

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const { t } = useI18n();

type Data = CostAnalyzeDataModel['results'];

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
});
const state = reactive({
    loading: true,
    data: null as Data|null,
    skeletons: [1, 2],
    chartData: computed(() => getRefinedXYChartData(state.data)),
});

const dateState = reactive({
    selectedMonth: computed(() => (dayjs.utc(widgetState.dateRange.end))),
    previousMonth: computed(() => (dayjs.utc(widgetState.dateRange.end).subtract(1, 'month'))),
    currentMonthlyCost: computed(() => getMonthlyCost(dateState.selectedMonth)),
    previousMonthlyCost: computed(() => getMonthlyCost(dateState.previousMonth)),
});
const [formattedCurrentMonth] = useDateRangeFormatter({
    start: computed(() => widgetState.dateRange.end),
    end: computed(() => widgetState.dateRange.end),
});
const [formattedPreviousMonth] = useDateRangeFormatter({
    start: computed(() => dayjs.utc(widgetState.dateRange.end).subtract(1, 'month').format(DATE_FORMAT)),
    end: computed(() => dayjs.utc(widgetState.dateRange.end).subtract(1, 'month').format(DATE_FORMAT)),
});

const displayState = reactive({
    differenceCost: computed<string|number>(() => {
        const cost = dateState.currentMonthlyCost - dateState.previousMonthlyCost;
        if (Number.isNaN(cost)) return '--';
        return cost;
    }),
    differenceCostRate: computed<string|number>(() => {
        let previousMonthlyCost = dateState.previousMonthlyCost;
        if (typeof displayState.differenceCost !== 'number') return '--';
        if (dateState.currentMonthlyCost === 0) previousMonthlyCost = 1;
        return (displayState.differenceCost / previousMonthlyCost * 100).toFixed(2);
    }),
    isDecreased: computed<boolean|undefined>(() => {
        if (typeof displayState.differenceCost === 'number') {
            if (displayState.differenceCost === 0) return undefined;
            return displayState.differenceCost < 0;
        }
        return undefined;
    }),
});

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCostAnalyze = getCancellableFetcher<CostAnalyzeDataModel>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const fetchData = async (): Promise<Data> => {
    apiQueryHelper.setFilters(widgetState.consoleFilters);
    try {
        const { status, response } = await fetchCostAnalyze({
            query: {
                granularity: widgetState.options.granularity,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    cost_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                field_group: ['date'],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response.results;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return [];
};

/* Util */
const getMonthlyCost = (month) => {
    if (!state.data?.length) return '--';
    const monthlyCost = state.data[0].cost_sum.find((costData) => costData.date === month.format(DATE_FORMAT))?.value || 0;
    return monthlyCost;
};

const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.chartData?.length ?? 0),
});
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    const yRendered = yAxis.get('renderer');
    yRendered.grid.template.setAll({ strokeOpacity: 0 });
    yRendered.labels.template.setAll({ visible: false });
    const seriesSettings = {
        valueYField: 'value',
    };
    const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
    chart.series.push(series);
    series.columns.template.setAll({
        fillOpacity: 0.5,
        strokeOpacity: 0,
    });
    chartHelper.setChartColors(chart, colorSet.value);
    chart.setAll({
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: -10,
    });

    series.columns.template.adapters.add('fillOpacity', (fillOpacity, target) => {
        const targetMonth = dayjs.utc(target.dataItem?.dataContext?.[DATE_FIELD_NAME]).format(DATE_FORMAT);
        if (targetMonth === dateState.previousMonth.format(DATE_FORMAT)) return 1;
        if (targetMonth === dateState.selectedMonth.format(DATE_FORMAT)) return 0.2;
        return fillOpacity;
    });

    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip, widgetState.currency, props.currencyRates);
    series.set('tooltip', tooltip);
    series.data.processor = chartHelper.createDataProcessor({
        dateFormat: DATE_FORMAT,
    });
    series.data.setAll(chartData);
};

const initWidget = async (data?: Data): Promise<Data> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data> => {
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
    onCurrencyUpdate: async () => {
        if (!state.data) return;
        chartHelper.refreshRoot();
        await nextTick();
        if (chartHelper.root.value) drawChart(state.chartData);
    },
});

defineExpose<WidgetExpose<Data>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="monthly-cost">
            <div class="cost">
                <p class="cost-label">
                    {{ t('DASHBOARDS.WIDGET.MONTHLY_COST.TOTAL_SPENT_IN', {period: formattedCurrentMonth}) }}
                </p>
                <p-data-loader class="data-loader"
                               :loading="state.loading"
                               :data="state.data"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div class="cost-value">
                        {{ currencyMoneyFormatter(dateState.currentMonthlyCost, widgetState.currency, props.currencyRates) }}
                    </div>
                    <div class="cost-info">
                        <p-i v-if="typeof displayState.isDecreased === 'boolean'"
                             :name="displayState.isDecreased ? 'ic_caret-down-filled-alt' : 'ic_caret-up-filled-alt'"
                             fill
                             width="1rem"
                             height="1rem"
                             :color="displayState.isDecreased ? green[700] : red[500]"
                             original
                        />
                        {{ typeof displayState.differenceCost === 'number' ? currencyMoneyFormatter(displayState.differenceCost, widgetState.currency, props.currencyRates) : '--' }}
                        <p-badge :style-type="displayState.isDecreased === undefined ? 'gray200' : displayState.isDecreased ? 'green200' : 'alert'"
                                 :badge-type="displayState.isDecreased ? 'subtle' : 'solid'"
                                 shape="square"
                        >
                            {{ displayState.differenceCostRate }} %
                        </p-badge>
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
            <p-divider />
            <div class="cost">
                <p class="cost-label">
                    {{ t('DASHBOARDS.WIDGET.MONTHLY_COST.TOTAL_SPENT_IN', {period: formattedPreviousMonth}) }}
                </p>
                <p-data-loader class="data-loader"
                               :loading="state.loading"
                               :data="state.data"
                               :loader-backdrop-opacity="1"
                               disable-empty-case
                               loader-type="skeleton"
                >
                    <div class="cost-value">
                        {{ currencyMoneyFormatter(dateState.previousMonthlyCost, widgetState.currency, props.currencyRates) }}
                    </div>
                    <div class="cost-info">
                        {{ dateState.previousMonth.format('MMM YYYY') }}
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
    .cost {
        @apply text-gray-900;
        line-height: 1.25;
        height: 5.75rem;
        .cost-label {
            font-size: 1rem;
        }
        .cost-value {
            margin: 0.25rem 0;
            font-size: 1.5rem;
        }
        .cost-info {
            @apply flex items-center text-gray-700 font-medium;
        }
        .p-badge {
            margin-left: 0.5rem;
        }
    }

    .p-divider {
        display: block;
        margin: 1.5rem 0;
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
}
</style>
