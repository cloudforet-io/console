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
import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { store } from '@/store';


export default {
    name: 'CostAnalysisColumnChart',
    props: {
        // name: {
        //     type: String,
        //     default: '',
        // },
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
    },
    setup(props) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chartRegistry: {},
            granularity: computed(() => store.state.service.costAnalysis.selectedGranularity),
        });

        /* util */
        const drawChart = (ctx) => {
            const params = {
                data: computed(() => props.chartData),
                valueOptions: {},
                categoryOptions: {
                    path: 'date',
                    legends: computed(() => props.legends),
                },
                chartContainer: ctx,
            };

            if (props.chartType === CHART_TYPE.STACKED_COLUMN) {
                useStackedColumnChart(params);
            } else if (props.chartType === CHART_TYPE.COLUMN) {
                useColumnChart(params);
            } else if (props.chartType === CHART_TYPE.LINE) {
                useLineChart(params);
            } else if (props.chartType === CHART_TYPE.STACKED_LINE) {
                useStackedLineChart(params);
            } else if (props.chartType === CHART_TYPE.DONUT) {
                usePieChart(params);
            }
        };

        watch([() => state.chartRef, () => props.chartData, () => props.chartType], ([ctx, chartData]) => {
            if (ctx && chartData.length > 0) {
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
