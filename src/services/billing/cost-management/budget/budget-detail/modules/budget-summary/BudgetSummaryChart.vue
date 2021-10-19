<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    useColumnChart,
} from '@/common/composables/dynamic-chart';
import { CHART_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import {secondary1} from "@/styles/colors";

type DateUnit = 'day' | 'month' | 'year';

export default {
    name: 'BudgetSummaryChart',
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
    },
    setup(props) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chartRegistry: {},
        });
        /* util */
        const drawChart = (ctx) => {
            const params = {
                data: computed(() => props.chartData),
                valueOptions: {},
                categoryOptions: {
                    path: 'date',
                    legends: computed(() => props.legends),
                    timeUnit: 'month' as DateUnit,
                },
                chartContainer: ctx,
            };
            const { chart } = useColumnChart(params);

            return chart;
        };
        watch([() => state.chartRef, () => props.chartData], ([ctx, chartData]) => {
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
