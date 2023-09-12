<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef,
} from 'vue';

import {
    PI, PDivider, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, sum } from 'lodash';

import { getRGBFromHex, commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { red, green } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrameNew.vue';
import type { CloudServiceStatsModel, Severity } from '@/services/dashboards/widgets/_configs/asset-config';
import { SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetProps, WidgetExpose, WidgetEmit } from '@/services/dashboards/widgets/_configs/config';
import { getDateAxisSettings } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidget } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget';
import type { XYChartData } from '@/services/dashboards/widgets/type';


interface Data extends CloudServiceStatsModel {
    value: number;
    severity: Severity;
}
interface FullData {
    trendData?: Data[];
    realtimeData?: Data[];
}
interface SeverityData {
    name: string;
    label: string;
    color: string;
    rgb: string;
    value?: number;
    diff?: number;
}

const SEVERITY_FAIL_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP).filter((status) => status.name !== 'PASS');
const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => 1),
});

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit, {});
const state = reactive({
    loading: true,
    data: null as FullData|null,
    chartData: computed<XYChartData[]>(() => state.data?.trendData ?? []),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(widgetState.settings?.date_range?.end).format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    severityData: computed<SeverityData[]>(() => {
        if (!state.data?.realtimeData) return [];
        const results: SeverityData[] = [];
        const prevMonth = dayjs.utc(widgetState.dateRange.end).subtract(1, 'month').format(DATE_FORMAT);
        const failFindingCountDataList = state.data.realtimeData.filter((d) => d.key === 'fail_finding_count');
        SEVERITY_FAIL_STATUS_MAP_VALUES.forEach((status) => {
            const currValue = failFindingCountDataList.find((d) => d.severity === status.name && d.date === widgetState.dateRange.end)?.value;
            const prevValue = failFindingCountDataList.find((d) => d.severity === status.name && d.date === prevMonth)?.value;
            results.push({
                name: status.name,
                label: status.label,
                color: status.color,
                value: currValue ?? 0,
                diff: (currValue && prevValue) ? currValue - prevValue : undefined,
                rgb: getRGBFromHex(status.color),
            });
        });
        return results;
    }),
    prevTotalFailureCount: computed<number>(() => {
        if (!state.data?.realtimeData) return 0;
        const prevMonth = dayjs.utc(widgetState.dateRange.end).subtract(1, 'month').format(DATE_FORMAT);
        const targetDataList = state.data.realtimeData.filter((d) => d.date === prevMonth && d.key === 'fail_finding_count') ?? [];
        return sum(targetDataList.map((d) => d.value));
    }),
    totalFailureCount: computed<number>(() => {
        if (!state.data?.realtimeData) return 0;
        const targetDataList = state.data.realtimeData.filter((d) => d.date === widgetState.dateRange.end && d.key === 'fail_finding_count') ?? [];
        return sum(targetDataList.map((d) => d.value));
    }),
    totalFailureComparingMessage: computed<string|undefined>(() => {
        if (state.totalFailureCount === state.prevTotalFailureCount) return undefined;
        if (state.prevTotalFailureCount < state.totalFailureCount) {
            return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.MORE_THAN_PREV_MONTH') as string;
        }
        return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.LESS_THAN_PREV_MONTH') as string;
    }),
    prevFailureRate: computed<number>(() => {
        if (!state.data?.realtimeData?.length) return 0;
        const prevMonth = dayjs.utc(widgetState.dateRange.end).subtract(1, 'month').format(DATE_FORMAT);
        const targetDataList = state.data.realtimeData.filter((d) => d.date === prevMonth) ?? [];
        return getFailureRate(targetDataList);
    }),
    failureRate: computed<number>(() => {
        if (!state.data?.realtimeData?.length) return 0;
        const targetDataList = state.data.realtimeData.filter((d) => d.date === widgetState.dateRange.end) ?? [];
        return getFailureRate(targetDataList);
    }),
    failureRateComparingMessage: computed<string|undefined>(() => {
        if (state.failureRate === state.prevFailureRate) return undefined;
        if (state.prevFailureRate < state.failureRate) {
            return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.MORE_THAN_PREV_MONTH') as string;
        }
        return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.LESS_THAN_PREV_MONTH') as string;
    }),
});

/* API */
const trendDataApiQueryHelper = new ApiQueryHelper();
const realtimeDataApiQueryHelper = new ApiQueryHelper();
const fetchTrendDataAnalyze = getCancellableFetcher<{results: Data[]}>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchRealtimeDataAnalyze = getCancellableFetcher<{results: Data[]}>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchTrendData = async (): Promise<Data[]> => {
    try {
        trendDataApiQueryHelper
            .setFilters(widgetState.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['fail_finding_count'], o: '' });
        const { status, response } = await fetchTrendDataAnalyze({
            query: {
                granularity: 'MONTHLY',
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                group_by: ['key', 'unit'],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
                    },
                },
                sort: [{
                    key: 'date',
                    desc: false,
                }],
                ...trendDataApiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return response.results;
        }
        return state.data?.trendData ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const fetchRealtimeData = async (): Promise<Data[]> => {
    try {
        realtimeDataApiQueryHelper
            .setFilters(widgetState.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['fail_finding_count', 'pass_finding_count'], o: '' });
        const prevMonth = dayjs.utc(widgetState.settings?.date_range?.end).subtract(1, 'month').format(DATE_FORMAT);
        const { status, response } = await fetchRealtimeDataAnalyze({
            query: {
                granularity: 'MONTHLY',
                start: prevMonth,
                end: widgetState.dateRange.end,
                group_by: ['key', 'unit', 'additional_info.severity'],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
                    },
                },
                ...realtimeDataApiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            return response.results;
        }
        return state.data?.realtimeData ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Util */
const getFailureRate = (targetDataList: Data[]): number => {
    const passCount = sum(targetDataList.filter((d) => d.key === 'pass_finding_count').map((d) => d.value));
    const failCount = sum(targetDataList.filter((d) => d.key === 'fail_finding_count').map((d) => d.value));
    const totalCount = passCount + failCount;
    return totalCount ? Math.round((failCount / totalCount) * 100) : 0;
};
const drawChart = (chartData: XYChartData[]) => {
    if (!chartData?.length) return;
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(widgetState.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    chartHelper.setChartColors(chart, colorSet.value);
    chart.get('cursor')?.lineX.setAll({
        visible: true,
    });

    const seriesSettings = {
        name: 'value',
        valueYField: 'value',
    };
    const series = chartHelper.createXYLineSeries(chart, seriesSettings);
    chart.series.push(series);
    // set data processor
    series.data.processor = chartHelper.createDataProcessor({
        dateFormat: DATE_FORMAT,
        dateFields: [DATE_FIELD_NAME],
    });

    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip);
    series.set('tooltip', tooltip);

    series.data.setAll(cloneDeep(chartData));
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    if (data) {
        state.data = data;
    } else {
        state.loading = true;
        const [trendData, realtimeData] = await Promise.all([fetchTrendData(), fetchRealtimeData()]);
        state.data = { trendData, realtimeData };
        state.loading = false;
    }
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    return state.data;
};
const refreshWidget = async (): Promise<FullData> => {
    state.loading = true;
    const [trendData, realtimeData] = await Promise.all([fetchTrendData(), fetchRealtimeData()]);
    state.data = { trendData, realtimeData };
    state.loading = false;
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: undefined,
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
                  class="total-failure-and-severity"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div class="summary-wrapper">
                <div class="left-wrapper">
                    <p class="title">
                        {{ $t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.TOTAL_FAILURE_COUNT') }}
                    </p>
                    <p class="value">
                        {{ numberFormatter(state.totalFailureCount) }}
                    </p>
                    <div v-if="state.totalFailureComparingMessage"
                         class="diff-wrapper"
                    >
                        <p-i :name="state.prevTotalFailureCount < state.totalFailureCount ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                             :color="state.prevTotalFailureCount < state.totalFailureCount ? red[500] : green[500]"
                        />
                        <span class="diff-value">{{ numberFormatter(Math.abs(state.prevTotalFailureCount - state.totalFailureCount)) }}</span>
                        <span class="diff-text">{{ state.totalFailureComparingMessage }}</span>
                    </div>
                </div>
                <p-divider :vertical="true" />
                <div class="right-wrapper">
                    <p class="title">
                        {{ $t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.FAILURE_RATE') }}
                    </p>
                    <p class="value">
                        {{ commaFormatter(state.failureRate) }}%
                    </p>
                    <div v-if="state.failureRateComparingMessage"
                         class="diff-wrapper"
                    >
                        <p-i :name="state.prevFailureRate < state.failureRate ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                             :color="state.prevFailureRate < state.failureRate ? red[500] : green[500]"
                        />
                        <span class="diff-value">{{ commaFormatter(Math.abs(state.prevFailureRate - state.failureRate)) }}%</span>
                        <span class="diff-text">{{ state.failureRateComparingMessage }}</span>
                    </div>
                </div>
            </div>
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.chartData"
                               loader-type="skeleton"
                               :loader-backdrop-opacity="1"
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
            <div class="severity-wrapper">
                <p class="title">
                    {{ $t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.SEVERITY') }}
                </p>
                <div class="box-wrapper">
                    <div v-for="(data, idx) in state.severityData"
                         :key="`severity-status-box-${idx}`"
                         class="severity-status-box"
                         :style="{'background-color': `rgba(${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}, 0.4)`}"
                    >
                        <div class="content-wrapper">
                            <p class="status-title">
                                {{ data.label }}
                            </p>
                            <p class="status-content">
                                <span class="status-value">{{ numberFormatter(data.value, 1) }}</span>
                                <span v-if="data.diff"
                                      class="status-rate"
                                >
                                    <p-i :name="data.diff > 0 ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                                         :color="data.diff > 0 ? red[500] : green[500]"
                                         width="1.5rem"
                                         height="1.5rem"
                                    />
                                    <span class="status-rate-value">{{ numberFormatter(Math.abs(data.diff)) }}</span>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.total-failure-and-severity {
    .data-container {
        .summary-wrapper {
            display: flex;
            justify-content: space-between;
            margin: 0;
            .left-wrapper, .right-wrapper {
                width: 50%;
                flex: 1 1 auto;
                position: relative;
                padding: 0.375rem 1.5rem;
                .title {
                    padding-bottom: 0.25rem;
                }
                .value {
                    @apply text-display-md;
                }
                .diff-wrapper {
                    @screen mobile {
                        .diff-text {
                            display: none;
                        }
                    }

                    @apply text-gray-700;
                    .diff-value {
                        @apply text-label-lg;
                        padding-right: 0.25rem;
                    }
                    .diff-text {
                        @apply text-label-sm;
                    }
                }
            }
            .left-wrapper {
                padding-right: 2rem;
            }
            .right-wrapper {
                padding-left: 2rem;
            }
        }
        .chart-wrapper {
            height: 140px;
            margin: 1rem 0;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
        .severity-wrapper {
            .title {
                padding-bottom: 0.25rem;
            }
            .box-wrapper {
                @apply grid-cols-12;
                display: grid;
                height: 4.875rem;
                .severity-status-box {
                    @apply col-span-3;
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    .status-title {
                        @apply text-gray-700 text-label-lg;
                        padding-bottom: 0.25rem;
                    }
                    .status-content {
                        display: flex;
                        align-items: flex-end;
                        flex-wrap: wrap;
                        .status-value {
                            @apply text-display-md;
                            padding-right: 0.25rem;
                        }
                        .status-rate {
                            @apply text-gray-700 text-label-lg;
                            display: inline-flex;
                            align-items: center;
                        }
                    }
                }
            }
        }
    }
}
</style>
