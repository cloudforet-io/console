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
import dayjs, { Dayjs } from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';

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
import {
    getTimeUnit,
    mergePrevChartDataAndCurrChartData,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { CHART_TYPE, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { TimeUnit } from '@amcharts/amcharts4/core';


interface Period {
    start: Dayjs;
    end: Dayjs;
}
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
        const convertXYChartDataWithPeriod = (timeUnit: TimeUnit): ChartData[] => {
            const chartData = [] as ChartData[];
            let now = props.period.start.clone();
            let accumulatedData: Record<string, number> = {};
            while (now.isSameOrBefore(props.period.end, timeUnit)) {
                let eachChartData: ChartData = {};
                // eslint-disable-next-line no-loop-func
                const existData: ChartData | undefined = props.chartData.find(d => now.isSame(d.date, timeUnit));
                if (props.granularity === GRANULARITY.ACCUMULATED) { /* calculate cumulative value */
                    accumulatedData = mergePrevChartDataAndCurrChartData(accumulatedData, existData);
                    eachChartData = {
                        date: now.format('YYYY-MM-DD'),
                        ...accumulatedData,
                    };
                } else if (existData) {
                    eachChartData = existData;
                } else {
                    eachChartData = {
                        date: now.format('YYYY-MM-DD'),
                    };
                }

                /* blur the last day/month/year */
                const today = dayjs.utc();
                if (now.isSame(props.period.end, timeUnit)) {
                    eachChartData.fillOpacity = 0.5;
                } else {
                    eachChartData.fillOpacity = 1;
                }

                chartData.push(eachChartData);
                now = now.add(1, timeUnit);
            }
            return chartData;
        };
        const convertPieChartDataWithLabel = chartData => chartData.map(d => ({
            category: props.legends.find(l => l.name === d.category)?.label || d.category,
            value: d.value,
        }));

        const drawChart = (chartContext) => {
            const timeUnit = getTimeUnit(props.granularity, props.period.start, props.period.end);
            let chartData = cloneDeep(props.chartData);
            if (props.chartType === CHART_TYPE.DONUT) {
                chartData = convertPieChartDataWithLabel(chartData);
            } else {
                chartData = convertXYChartDataWithPeriod(timeUnit);
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

            if (props.chartType !== CHART_TYPE.DONUT) {
                chart.scrollbarX = new am4core.Scrollbar();
            }
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
