<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="total-failure-and-severity"
                  @refresh="refreshWidget"
    >
        <div class="data-container">
            <div class="summary-wrapper">
                <div class="left-wrapper">
                    <p class="title">
                        {{ $t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.TOTAL_FAILURE_COUNT') }}
                    </p>
                    <p class="value">
                        {{ state.totalFailureCount === undefined ? '--' : state.totalFailureCount }}
                    </p>
                    <div v-if="state.totalFailureComparingMessage"
                         class="diff-wrapper"
                    >
                        <p-i :name="state.prevTotalFailureCount < state.totalFailureCount ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                             :color="state.prevTotalFailureCount < state.totalFailureCount ? red[500] : green[500]"
                        />
                        <span class="diff-value">{{ Math.abs(state.prevTotalFailureCount - state.totalFailureCount) }}</span>
                        <span class="diff-text">{{ state.totalFailureComparingMessage }}</span>
                    </div>
                </div>
                <p-divider :vertical="true" />
                <div class="right-wrapper">
                    <p class="title">
                        {{ $t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.FAILURE_RATE') }}
                    </p>
                    <p class="value">
                        {{ state.failureRate === undefined ? '--' : state.failureRate }}%
                    </p>
                    <div v-if="state.failureRateComparingMessage"
                         class="diff-wrapper"
                    >
                        <p-i :name="state.prevFailureRate < state.failureRate ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                             :color="state.prevFailureRate < state.failureRate ? red[500] : green[500]"
                        />
                        <span class="diff-value">{{ Math.abs(state.prevFailureRate - state.failureRate) }}%</span>
                        <span class="diff-text">{{ state.failureRateComparingMessage }}</span>
                    </div>
                </div>
            </div>
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.chartData"
                               loader-type="skeleton"
                               disable-empty-case
                               :loader-backdrop-opacity="1"
                               show-data-from-scratch
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
                                <span class="status-value">{{ data.value === undefined ? '--': data.value }}</span>
                                <span v-if="data.diff"
                                      class="status-rate"
                                >
                                    <p-i :name="data.diff > 0 ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                                         :color="data.diff > 0 ? red[500] : green[500]"
                                         width="1.5rem"
                                         height="1.5rem"
                                    />
                                    <span class="status-rate-value">{{ Math.abs(data.diff) }}</span>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>
<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PI, PDivider, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, sum } from 'lodash';

import { getRGBFromHex } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { red, green } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { CloudServiceStatsModel } from '@/services/dashboards/widgets/_configs/asset-config';
import { SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetProps, WidgetExpose } from '@/services/dashboards/widgets/_configs/config';
import { getDateAxisSettings } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { XYChartData } from '@/services/dashboards/widgets/type';


interface FullData {
    trendData?: CloudServiceStatsModel[];
    realtimeData?: CloudServiceStatsModel[];
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
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => 1),
});
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    chartData: computed<XYChartData[]>(() => state.data?.trendData),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    severityData: computed<SeverityData[]>(() => {
        if (!state.data?.realtimeData) return [];
        const results: SeverityData[] = [];
        const prevMonth = dayjs.utc(state.dateRange.end).subtract(1, 'month').format(DATE_FORMAT);
        SEVERITY_FAIL_STATUS_MAP_VALUES.forEach((status) => {
            const currValue = state.data.realtimeData.find((d) => d.severity === status.name && d.date === state.dateRange.end)?.value;
            const prevValue = state.data.realtimeData.find((d) => d.severity === status.name && d.date === prevMonth)?.value;
            results.push({
                name: status.name,
                label: status.label,
                color: status.color,
                value: currValue,
                diff: (currValue && prevValue) ? currValue - prevValue : undefined,
                rgb: getRGBFromHex(status.color),
            });
        });
        return results;
    }),
    prevTotalFailureCount: computed<number|undefined>(() => {
        if (!state.data?.realtimeData) return undefined;
        const prevMonth = dayjs.utc(state.dateRange.end).subtract(1, 'month').format(DATE_FORMAT);
        const targetDataList = state.data.realtimeData.filter((d) => d.date === prevMonth && d.key === 'fail_finding_count') ?? [];
        return sum(targetDataList.map((d) => d.value));
    }),
    totalFailureCount: computed<number|undefined>(() => {
        if (!state.data?.realtimeData) return undefined;
        const targetDataList = state.data.realtimeData.filter((d) => d.date === state.dateRange.end && d.key === 'fail_finding_count') ?? [];
        return sum(targetDataList.map((d) => d.value));
    }),
    totalFailureComparingMessage: computed<TranslateResult|undefined>(() => {
        if (state.totalFailureCount === undefined
            || state.prevTotalFailureCount === undefined
            || state.totalFailureCount === state.prevTotalFailureCount
        ) return undefined;
        if (state.prevTotalFailureCount < state.totalFailureCount) {
            return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.MORE_THAN_PREV_MONTH');
        }
        return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.LESS_THAN_PREV_MONTH');
    }),
    prevFailureRate: computed<number|undefined>(() => {
        if (!state.data?.realtimeData.length) return undefined;
        const prevMonth = dayjs.utc(state.dateRange.end).subtract(1, 'month').format(DATE_FORMAT);
        const targetDataList = state.data.realtimeData.filter((d) => d.date === prevMonth) ?? [];
        return getFailureRate(targetDataList);
    }),
    failureRate: computed<number|undefined>(() => {
        if (!state.data?.realtimeData.length) return undefined;
        const targetDataList = state.data.realtimeData.filter((d) => d.date === state.dateRange.end) ?? [];
        return getFailureRate(targetDataList);
    }),
    failureRateComparingMessage: computed<TranslateResult|undefined>(() => {
        if (state.failureRate === undefined
            || state.prevFailureRate === undefined
            || state.failureRate === state.prevFailureRate
        ) return undefined;
        if (state.prevFailureRate < state.failureRate) {
            return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.MORE_THAN_PREV_MONTH');
        }
        return i18n.t('DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.LESS_THAN_PREV_MONTH');
    }),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* API */
const apiQueryHelper = new ApiQueryHelper();
const fetchTrendData = async (): Promise<CloudServiceStatsModel[]> => {
    try {
        apiQueryHelper
            .setFilters(state.consoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['fail_finding_count'], o: '' });
        const { results } = await SpaceConnector.clientV2.inventory.cloudServiceStats.analyze({
            query: {
                granularity: 'MONTHLY',
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: ['key', 'unit'],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
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
const fetchRealtimeData = async (): Promise<CloudServiceStatsModel[]> => {
    try {
        apiQueryHelper
            .setFilters(state.consoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({ k: 'key', v: ['fail_finding_count', 'pass_findings_count'], o: '' });
        const prevMonth = dayjs.utc(state.settings?.date_range?.start).subtract(1, 'month').format(DATE_FORMAT);
        const { results } = await SpaceConnector.clientV2.inventory.cloudServiceStats.analyze({
            query: {
                granularity: 'MONTHLY',
                start: prevMonth,
                end: state.dateRange.end,
                group_by: ['key', 'unit', 'additional_info.severity'],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
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
const getFailureRate = (targetDataList: CloudServiceStatsModel[]): number => {
    const passCount = sum(targetDataList.filter((d) => d.key === 'pass_finding_count').map((d) => d.value));
    const failCount = sum(targetDataList.filter((d) => d.key === 'fail_finding_count').map((d) => d.value));
    const totalCount = passCount + failCount;
    return totalCount ? Math.round((failCount / totalCount) * 100) : 0;
};
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(state.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    chartHelper.setChartColors(chart, colorSet.value);

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
    series.data.setAll(cloneDeep(chartData));
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    if (data) {
        state.data = data;
    } else {
        const [trendData, realtimeData] = await Promise.all([fetchTrendData(), fetchRealtimeData()]);
        state.data = { trendData, realtimeData };
    }
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (): Promise<FullData> => {
    await nextTick();
    state.loading = true;
    const [trendData, realtimeData] = await Promise.all([fetchTrendData(), fetchRealtimeData()]);
    state.data = { trendData, realtimeData };
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: undefined,
    refreshWidget,
    props,
    state,
});
defineExpose<WidgetExpose>({
    initWidget,
    refreshWidget,
});
</script>
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
