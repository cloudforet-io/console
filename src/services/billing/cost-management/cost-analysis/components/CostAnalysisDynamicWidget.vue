<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    useColumnChart, useLineChart, usePieChart, useStackedColumnChart, useStackedLineChart,
} from '@/common/composables/dynamic-chart';
import { CHART_TYPE, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { ChartType, Granularity } from '@/services/billing/cost-management/cost-analysis/store/type';
import { ChartData, DynamicChartStateArgs, Legend } from '@/common/composables/dynamic-chart/type';
import * as am4core from '@amcharts/amcharts4/core';


interface Props {
    chartType: ChartType;
    chartData: ChartData[];
    legends: Legend[];
    granularity: Granularity;
}
type DateUnit = 'day' | 'month' | 'year';


export default {
    name: 'CostAnalysisColumnChart',
    props: {
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
        // period: {
        //     type: Object,
        //     default: () => ({
        //         start: dayjs.utc().startOf('month'),
        //         end: dayjs.utc(),
        //     }),
        // },
    },
    setup(props: Props) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
        });

        /* util */
        const getUnit = () => {
            // todo: granularity 가 accumulated 면 period 에 따라 unit 지정
            let unit: DateUnit;
            if (props.granularity === GRANULARITY.ACCUMULATED) {
                unit = 'day';
            } else if (props.granularity === GRANULARITY.MONTHLY) {
                unit = 'month';
            } else if (props.granularity === GRANULARITY.YEARLY) {
                unit = 'year';
            } else {
                unit = 'day';
            }

            return unit;
        };
        const drawChart = (ctx) => {
            const params: DynamicChartStateArgs = {
                data: computed(() => props.chartData),
                valueOptions: {},
                categoryOptions: {
                    legends: computed(() => props.legends),
                    path: 'date',
                    timeUnit: getUnit(),
                },
                chartContainer: ctx,
            };

            if (props.chartType === CHART_TYPE.STACKED_COLUMN) {
                const { chart } = useStackedColumnChart(params);
                chart.scrollbarX = new am4core.Scrollbar();
            } else if (props.chartType === CHART_TYPE.COLUMN) {
                const { chart } = useColumnChart(params);
                chart.scrollbarX = new am4core.Scrollbar();
            } else if (props.chartType === CHART_TYPE.LINE) {
                const { chart } = useLineChart(params);
                chart.scrollbarX = new am4core.Scrollbar();
            } else if (props.chartType === CHART_TYPE.STACKED_LINE) {
                const { chart } = useStackedLineChart(params);
                chart.scrollbarX = new am4core.Scrollbar();
            } else if (props.chartType === CHART_TYPE.DONUT) {
                usePieChart(params);
            }
        };

        watch([() => state.chartRef, () => props.chartData], ([ctx, chartData]) => {
            if (ctx && (chartData as ChartData[]).length > 0) {
                drawChart(ctx);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
</style>
