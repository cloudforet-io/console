<template>
    <div class="p-dynamic-chart-donut">
        <div ref="chartRef" class="donut-chart" />
        <div class="legend-group">
            <p-status v-for="(item, idx) in data" :key="item[valueOptions.key]" :icon-color="colors[idx]">
                <span class="name">{{ item[nameOptions.key] }}</span> <span class="value">{{ item[valueOptions.key] }}</span>
            </p-status>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, onMounted, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import * as am4core from '@amcharts/amcharts4/core';
import { PieChart } from '@amcharts/amcharts4/charts';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS,
} from '@/data-display/dynamic/dynamic-chart/config';

import { DynamicChartTemplateProps } from '@/data-display/dynamic/dynamic-chart/type';
import { drawDummyPieChart, drawPieChart } from '@/data-display/dynamic/dynamic-chart/templates/donut/helper';
import PStatus from '@/data-display/status/PStatus.vue';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';


export default defineComponent<DynamicChartTemplateProps>({
    name: 'PDynamicChartDonut',
    components: { PStatus },
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        valueOptions: {
            type: Object as () => DynamicChartTemplateProps['valueOptions'],
            default: () => ({ ...DEFAULT_VALUE_OPTIONS }),
        },
        nameOptions: {
            type: Object as () => DynamicChartTemplateProps['nameOptions'],
            default: () => ({ ...DEFAULT_NAME_OPTIONS }),
        },
    },
    setup(props) {
        const state = reactive({
            chart: null as null|PieChart,
            chartRef: null as null|HTMLElement,
            colors: DEFAULT_CHART_COLORS,
            isDummyChart: false,
        });

        const disposeChart = () => {
            if (state.chart) state.chart.dispose();
        };

        const drawChart = () => {
            const ctx = state.chartRef;
            if (!ctx) return;

            const chart = am4core.create(ctx, PieChart);

            if (props.data.length) {
                drawPieChart(chart, props.nameOptions, props.valueOptions);
                chart.data = props.data;
                state.isDummyChart = false;
            } else {
                drawDummyPieChart(chart, props.nameOptions, props.valueOptions);
                state.isDummyChart = true;
            }

            state.chart = chart;
        };

        const updateChartData = (data: any[]) => {
            if (state.chart) {
                if (!data.length && state.isDummyChart) {
                    return;
                }

                if (data.length && !state.isDummyChart) {
                    state.chart.data = data;
                    return;
                }

                disposeChart();
                drawChart();
            }
        };

        onMounted(() => {
            drawChart();
        });

        const stopDataWatch = watch(() => props.data, (data) => {
            updateChartData(data);
        });

        onUnmounted(() => {
            if (stopDataWatch) stopDataWatch();
            disposeChart();
        });

        return {
            ...toRefs(state),
            disposeChart,
            drawChart,
            updateChartData,
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-chart-donut {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .donut-chart {
        height: 50%;
    }
    .legend-group {
        @apply flex flex-col;
        .p-status {
            @apply w-full;
            margin-top: 0.125rem;
            &:first-of-type {
                margin-top: 0;
            }
            .text {
                @apply flex items-center flex-grow text-gray-900;
                font-size: 0.875rem;
                line-height: 1.43;
                .name {
                    @apply mb-0;
                    font-size: inherit;
                    color: inherit;
                }
                .value {
                    @apply ml-auto;
                    color: inherit;
                }
            }
        }
    }
}
</style>
