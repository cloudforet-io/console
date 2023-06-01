<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="total-failure-and-severity"
                  @refresh="refreshWidget"
    >
        <div class="data-container">
            <div class="summary-wrapper">
                <div class="left-wrapper">
                    <!--song-lang-->
                    <p class="title">
                        <!--TODO: translation-->
                        Total failure count
                    </p>
                    <p class="value">
                        <!--TODO: real data-->
                        880
                    </p>
                    <div class="diff-wrapper">
                        <p-i name="ic_caret-up-filled"
                             :color="red[500]"
                        />
                        <span class="diff-value">86</span>
                        <!--TODO: translation-->
                        <span class="diff-text">more than previous 30 days</span>
                    </div>
                </div>
                <p-divider :vertical="true" />
                <div class="right-wrapper">
                    <!--TODO: translation-->
                    <p class="title">
                        Failure rate
                    </p>
                    <p class="value">
                        15.94%
                    </p>
                    <div class="description">
                        <span class="rate" />
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
                <!--TODO: translation-->
                <p class="title">
                    Severity
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
                                <span class="status-value">{{ data.value }}</span>
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

import {
    PI, PDivider, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, random } from 'lodash';

import { getRGBFromHex } from '@cloudforet/core-lib';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { red, green } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps, WidgetExpose } from '@/services/dashboards/widgets/_configs/config';
import { SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import { getDateAxisSettings } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { XYChartData } from '@/services/dashboards/widgets/type';


// type Data = CostAnalyzeDataModel['results'];
type Data = any[];

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
    ...toRefs(useWidgetState<Data>(props)),
    chartData: computed<XYChartData[]>(() => state.data),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const start = dayjs.utc(end).subtract(11, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    severityData: computed(() => {
        const results: any[] = []; // TODO: fix type after get real data
        Object.values(SEVERITY_STATUS_MAP).forEach((severity) => {
            if (severity.name === 'pass') return;
            const currValue = random(0, 200);
            const prevValue = random(0, 200);
            results.push({
                ...severity,
                value: currValue,
                diff: currValue - prevValue,
                rgb: getRGBFromHex(severity.color),
            });
        });
        return results;
    }),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* API */
const fetchData = async (): Promise<Data> => {
    try {
        // TODO: change to real data
        const results = await new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve([
                    { date: '2022-06', value: random(500, 1200) },
                    { date: '2022-07', value: random(500, 1200) },
                    { date: '2022-08', value: random(500, 1200) },
                    { date: '2022-09', value: random(500, 1200) },
                    { date: '2022-10', value: random(500, 1200) },
                    { date: '2022-11', value: random(500, 1200) },
                    { date: '2022-12', value: random(500, 1200) },
                    { date: '2023-01', value: random(500, 1200) },
                    { date: '2023-02', value: random(500, 1200) },
                    { date: '2023-03', value: random(500, 1200) },
                    { date: '2023-04', value: random(500, 1200) },
                    { date: '2023-05', value: random(500, 1200) },
                ]);
            }, 2000);
        });
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Util */
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

const initWidget = async (): Promise<Data> => {
    state.loading = true;
    state.data = await fetchData();
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
