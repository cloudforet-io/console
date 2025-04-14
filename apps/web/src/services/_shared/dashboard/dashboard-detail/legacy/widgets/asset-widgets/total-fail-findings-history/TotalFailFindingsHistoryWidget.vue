<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PI, PDataLoader, PProgressBar,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import { GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setXYSharedTooltipTextWithRate } from '@/common/composables/amcharts5/xy-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { red, green } from '@/styles/colors';

import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetColorSet } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { SEVERITY_STATUS_MAP } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_constants/compliance-constant';
import { getDateAxisSettings } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-helper';
import type { Severity } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/compliance-type';
import type { WidgetProps, WidgetExpose, WidgetEmit } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';

interface XYChartData {
    date?: string;
    [resourceName: string]: number | any; // AmazonCloudFront: 12333
}

interface SubData {
    severity: Severity;
    value: number;
}
interface Data {
    pass_finding_count?: SubData[];
    fail_finding_count?: SubData[];
    _total_fail_finding_count?: number;
    _total_pass_finding_count?: number;
    date: string;
}
interface ChartData {
    date: string;
    CRITICAL?: number;
    HIGH?: number;
    MEDIUM?: number;
    LOW?: number;
}

const SEVERITY_FAIL_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP).filter((status) => status.name !== 'PASS');
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => widgetState.widgetConfig.theme?.inherit_count ?? 0),
});

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {
    dateRange: computed<DateRange>(() => {
        if (widgetState.options.granularity === GRANULARITY.YEARLY) {
            const end = dayjs.utc(widgetState.dashboardOptions?.date_range?.end).format(state.dateFormat);
            const start = dayjs.utc(end).subtract(2, 'year').format(state.dateFormat);
            return { start, end };
        } if (widgetState.options.granularity === GRANULARITY.DAILY) {
            const end = dayjs.utc(widgetState.dashboardOptions?.date_range?.end).format(state.dateFormat);
            const start = dayjs.utc(end).subtract(13, 'day').format(state.dateFormat);
            return { start, end };
        }
        const end = dayjs.utc(widgetState.dashboardOptions?.date_range?.end).format(state.dateFormat);
        const start = dayjs.utc(end).subtract(11, 'month').format(state.dateFormat);
        return { start, end };
    }),
    widgetLocation: undefined,
});
const state = reactive({
    loading: true,
    dateFormat: computed<string>(() => {
        if (widgetState.options.granularity === GRANULARITY.YEARLY) return 'YYYY';
        if (widgetState.options.granularity === GRANULARITY.DAILY) return 'YYYY-MM-DD';
        return 'YYYY-MM';
    }),
    timeUnit: computed<TimeUnit>(() => {
        if (widgetState.options.granularity === GRANULARITY.YEARLY) return 'year';
        if (widgetState.options.granularity === GRANULARITY.DAILY) return 'day';
        return 'month';
    }),
    data: null as Data[]|null,
    chartData: computed<ChartData[]>(() => getRefinedChartData(state.data)),
    currDateText: computed<string>(() => {
        let _dateFormat = 'MMM, YYYY';
        if (widgetState.options.granularity === GRANULARITY.YEARLY) _dateFormat = 'YYYY';
        if (widgetState.options.granularity === GRANULARITY.DAILY) _dateFormat = 'MMM D, YYYY';
        return dayjs.utc(widgetState.dateRange.end).format(_dateFormat);
    }),
    currData: computed<Data>(() => {
        const currDate = dayjs.utc(widgetState.dateRange.end).format(state.dateFormat);
        return state.data?.find((d) => d.date === currDate);
    }),
    prevData: computed<Data>(() => {
        const prevDate = dayjs.utc(widgetState.dateRange.end).subtract(1, state.timeUnit).format(state.dateFormat);
        return state.data?.find((d) => d.date === prevDate);
    }),
    currTotalCount: computed<number>(() => (state.currData?._total_pass_finding_count ?? 0) + (state.currData?._total_fail_finding_count ?? 0)),
    currTotalFailureCount: computed<number>(() => state.currData?._total_fail_finding_count ?? 0),
    prevTotalFailureCount: computed<number>(() => state.prevData?._total_fail_finding_count ?? 0),
    totalFailureComparingMessage: computed<string|undefined>(() => {
        if (state.currTotalFailureCount === state.prevTotalFailureCount) return undefined;
        if (state.prevTotalFailureCount < state.currTotalFailureCount) {
            if (widgetState.options.granularity === GRANULARITY.YEARLY) return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_STATUS.MORE_THAN_PREV_YEAR') as string;
            if (widgetState.options.granularity === GRANULARITY.DAILY) return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_STATUS.MORE_THAN_PREV_DAY') as string;
            return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_STATUS.MORE_THAN_PREV_MONTH') as string;
        }
        if (widgetState.options.granularity === GRANULARITY.YEARLY) return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_STATUS.LESS_THAN_PREV_YEAR') as string;
        if (widgetState.options.granularity === GRANULARITY.DAILY) return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_STATUS.LESS_THAN_PREV_DAY') as string;
        return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_STATUS.LESS_THAN_PREV_MONTH') as string;
    }),
    failureRate: computed<number>(() => (state.currTotalCount ? Math.round((state.currTotalFailureCount / state.currTotalCount) * 100) : 0)),
});

/* API */
const trendDataApiQueryHelper = new ApiQueryHelper();
const fetchTrendDataAnalyze = getCancellableFetcher<object, {results: Data[]}>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchTrendData = async (): Promise<Data[]> => {
    try {
        state.loading = true;
        trendDataApiQueryHelper.setFilters(widgetState.consoleFilters);
        const { status, response } = await fetchTrendDataAnalyze({
            query_set_id: widgetState.options.cloud_service_query_set,
            query: {
                granularity: widgetState.options.granularity,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                group_by: ['additional_info.severity'],
                fields: {
                    pass_finding_count: {
                        key: 'data.pass_finding_count',
                        operator: 'sum',
                    },
                    fail_finding_count: {
                        key: 'data.fail_finding_count',
                        operator: 'sum',
                    },
                },
                field_group: ['severity'],
                sort: [{
                    key: 'date',
                    desc: false,
                }],
                ...trendDataApiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            state.loading = false;
            return response.results;
        }
        return state.data ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.loading = false;
        return [];
    }
};

/* Util */
const getRefinedChartData = (data: Data[]): ChartData[] => {
    if (!data) return [];
    const results: ChartData[] = [];
    data.forEach((d) => {
        const failData: Record<string, number> = {};
        d.fail_finding_count?.forEach((fd) => {
            failData[fd.severity] = fd.value ?? 0;
        });
        results.push({
            date: d.date,
            ...failData,
        });
    });
    return results;
};
const drawChart = (chartData: XYChartData[]) => {
    if (!chartData?.length) return;
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange, widgetState.options.granularity));
    xAxis.get('baseInterval').timeUnit = state.timeUnit;
    chartHelper.setChartColors(chart, colorSet.value);
    chart.get('cursor')?.lineX.setAll({
        visible: true,
    });

    SEVERITY_FAIL_STATUS_MAP_VALUES.forEach((status) => {
        const seriesSettings = {
            name: status.label,
            valueYField: status.name,
            stroke: status.color,
            fill: status.color,
            stacked: true,
        };

        // create series
        const series = chartHelper.createXYLineSeries(chart, seriesSettings);

        // add series to chart
        chart.series.push(series);

        // set series style
        series.fills.template.setAll({
            opacity: 0.7,
            visible: true,
        });

        // set data processor to series
        let dateFormat = 'yyyy-MM';
        if (widgetState.options.granularity === GRANULARITY.DAILY) dateFormat = 'yyyy-MM-dd';
        else if (widgetState.options.granularity === GRANULARITY.YEARLY) dateFormat = 'yyyy';
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat,
            dateFields: [DATE_FIELD_NAME],
        });

        // create tooltip
        const tooltip = chartHelper.createTooltip();
        setXYSharedTooltipTextWithRate(chart, tooltip);

        // set tooltip to series
        series.set('tooltip', tooltip);

        // set data to series
        series.data.setAll(cloneDeep(chartData));
    });
    const chartLegends = chartHelper.createLegend({
        nameField: 'name',
        paddingTop: 20,
    });
    chart.children.push(chartLegends);
    chartLegends.data.setAll(chart.series.values);
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    if (data) {
        state.data = data;
    } else {
        state.data = await fetchTrendData();
    }
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    return state.data;
};
const refreshWidget = async (): Promise<Data[]> => {
    state.data = await fetchTrendData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: undefined,
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
});
defineExpose<WidgetExpose>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="total-fail-findings-status"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div class="summary-wrapper">
                <p class="title">
                    Total failure count
                    <span class="date-text">({{ state.currDateText }})</span>
                </p>
                <div class="count-wrapper">
                    <div class="left-part">
                        {{ numberFormatter(state.currTotalFailureCount) }}
                    </div>
                    <div class="right-part">
                        <span class="text">out of </span>
                        <span class="count">{{ numberFormatter(state.currTotalCount) }}</span>
                    </div>
                </div>
            </div>
            <div class="diff-wrapper"
                 :style="{ color: state.prevTotalFailureCount < state.currTotalFailureCount ? red[500] : green[500] }"
            >
                <p-i :name="state.prevTotalFailureCount < state.currTotalFailureCount ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                     color="inherit"
                />
                <span class="diff-value">{{ numberFormatter(Math.abs(state.prevTotalFailureCount - state.currTotalFailureCount)) }}</span>
                <span class="diff-text">{{ state.totalFailureComparingMessage }}</span>
            </div>
            <p-progress-bar :percentage="state.failureRate"
                            height="1.5rem"
                            :color="colorSet[0]"
            />
            <div class="rate-text">
                {{ state.failureRate }}%
            </div>
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="props.loading || state.loading"
                               :data="state.chartData"
                               loader-type="skeleton"
                               :loader-backdrop-opacity="1"
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
.total-fail-findings-status {
    .data-container {
        .summary-wrapper {
            .title {
                @apply text-label-lg;
                padding-bottom: 0.25rem;
                .date-text {
                    @apply text-gray-600;
                    font-weight: 700;
                }
            }
            .count-wrapper {
                display: flex;
                justify-content: space-between;
                padding-bottom: 0.5rem;
                .left-part {
                    @apply text-display-lg;
                    font-weight: 700;
                }
                .right-part {
                    display: flex;
                    align-items: flex-end;
                    .text {
                        @apply text-gray-600 text-label-lg;
                        padding-right: 0.25rem;
                    }
                    .count {
                        @apply text-display-md;
                        font-weight: 500;
                    }
                }
            }
        }
        .diff-wrapper {
            display: flex;
            align-items: center;
            padding-bottom: 0.5rem;
            .diff-value {
                @apply text-label-lg;
                font-weight: 700;
            }
            .diff-text {
                @apply text-gray-700 text-label-sm;
                padding-left: 0.25rem;
            }
        }
        .rate-text {
            @apply text-display-md;
            padding-top: 0.5rem;
        }
        .chart-wrapper {
            height: 11rem;
            margin: 1rem 0;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
    }
}
</style>
