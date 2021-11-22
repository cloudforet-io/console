<template>
    <p-chart-loader :loading="loading" class="cost-analysis-dynamic-widget">
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartRef" class="chart" />
    </p-chart-loader>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';

import {
    useColumnChart, useLineChart, usePieChart, useStackedColumnChart, useStackedLineChart,
} from '@/common/composables/dynamic-chart';
import { ChartData, DynamicChartStateArgs, Legend } from '@/common/composables/dynamic-chart/type';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';
import { getTimeUnit } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { mergePrevChartDataAndCurrChartData } from '@/services/billing/cost-management/cost-analysis/lib/converting-data-helper';
import { CHART_TYPE, GRANULARITY, Period } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { TimeUnit } from '@amcharts/amcharts4/core';

interface Props {
    loading: boolean;
    chart: XYChart | PieChart;
    chartType: CHART_TYPE;
    chartData: ChartData[];
    legends: Legend[];
    granularity: GRANULARITY;
    period: Period;
}

export default {
    name: 'CostAnalysisDynamicWidget',
    components: {
        PChartLoader,
        PSkeleton,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        chart: {
            type: Object,
            default: () => ({}),
        },
        chartType: {
            type: String,
            default: CHART_TYPE.STACKED_COLUMN,
            validator(value: any) {
                return Object.values(CHART_TYPE).includes(value);
            },
        },
        chartData: {
            type: Array,
            default: () => ([]),
        },
        legends: {
            type: Array,
            default: () => ([]),
        },
        granularity: {
            type: String,
            default: GRANULARITY.DAILY,
            validator(value: any) {
                return Object.values(GRANULARITY).includes(value);
            },
        },
        period: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            proxyChart: makeProxy('chart', props, emit),
        });

        /* util */
        const getAccumulatedData = (chartData: ChartData[], period: Period, timeUnit: TimeUnit): ChartData[] => {
            const accumulatedChartData = [] as ChartData[];
            let now = dayjs(period.start).clone();
            let accumulatedData: Record<string, number> = {};
            while (now.isSameOrBefore(dayjs(period.end), timeUnit)) {
                let eachChartData: ChartData = {};
                // eslint-disable-next-line no-loop-func
                const existData = chartData.find(d => now.isSame(d.date, timeUnit));
                accumulatedData = mergePrevChartDataAndCurrChartData(accumulatedData, existData);
                eachChartData = {
                    date: now.toDate(),
                    ...accumulatedData,
                };
                accumulatedChartData.push(eachChartData);
                now = now.add(1, timeUnit);
            }
            return accumulatedChartData;
        };
        const fillDefaultDataOfLastDay = (chartData: ChartData[], period: Period, timeUnit: TimeUnit): ChartData[] => {
            const convertedChartData = [...chartData];
            const dataOfLastDate = chartData.find(d => dayjs(period.end).isSame(d.date, timeUnit));
            if (!dataOfLastDate) {
                convertedChartData.push({
                    date: dayjs(period.end).toDate(),
                });
            }
            return convertedChartData;
        };

        const drawChart = (chartContext) => {
            const timeUnit = getTimeUnit(props.granularity, dayjs(props.period.start), dayjs(props.period.end));
            let chartData = cloneDeep(props.chartData);
            if (props.chartType !== CHART_TYPE.DONUT) {
                if (props.granularity === GRANULARITY.ACCUMULATED) {
                    chartData = getAccumulatedData(props.chartData, props.period, timeUnit);
                } else {
                    chartData = fillDefaultDataOfLastDay(props.chartData, props.period, timeUnit);
                }
            }
            const params: DynamicChartStateArgs = {
                data: chartData,
                valueOptions: {},
                categoryOptions: {
                    legends: computed(() => props.legends),
                    path: 'date',
                    timeUnit,
                },
                chartContainer: chartContext,
            };

            let chart;
            if (props.chartType === CHART_TYPE.STACKED_COLUMN) {
                ({ chart } = useStackedColumnChart(params));
            } else if (props.chartType === CHART_TYPE.COLUMN) {
                ({ chart } = useColumnChart(params));
            } else if (props.chartType === CHART_TYPE.LINE) {
                ({ chart } = useLineChart(params));
            } else if (props.chartType === CHART_TYPE.STACKED_LINE) {
                ({ chart } = useStackedLineChart(params));
            } else if (props.chartType === CHART_TYPE.DONUT) {
                ({ chart } = usePieChart(params));
            }
            state.proxyChart = chart;
        };

        watch([() => state.chartRef, () => props.loading], async ([chartContext, loading]) => {
            if (chartContext && !loading) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.cost-analysis-dynamic-widget {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
