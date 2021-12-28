<template>
    <div ref="chartRef" class="p-dynamic-chart-column">
        <!--        <p-progress-bar v-for="item in data" :key="item[nameOptions.key]"></p-progress-bar>-->
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    onMounted, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { maxBy } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import { XYChart } from '@amcharts/amcharts4/charts';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS,
} from '@/data-display/dynamic/dynamic-chart/config';
import { DynamicChartTemplateProps } from '@/data-display/dynamic/dynamic-chart/type';
import { drawColumnChart } from '@/data-display/dynamic/dynamic-chart/templates/column/helper';


export default defineComponent<DynamicChartTemplateProps>({
    name: 'PDynamicChartColumn',
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
            chart: null as null|XYChart,
            chartRef: null as null|HTMLElement,
            max: computed<number>(() => {
                if (!props.data.length) return 0;
                const valueKey = props.valueOptions.key;
                const maxItem = maxBy(props.data, d => d[valueKey]);
                return maxItem ? maxItem[valueKey] : 0;
            }),
            enrichedData: computed(() => {
                const max = state.max;
                return props.data.map(d => ({
                    ...d, _dummy: max,
                }));
            }),
        });

        const disposeChart = () => {
            if (state.chart) state.chart.dispose();
        };

        const drawChart = () => {
            const ctx = state.chartRef;
            if (!ctx) return;

            const chart = am4core.create(ctx, XYChart);

            drawColumnChart(chart, props.nameOptions, props.valueOptions);

            chart.data = state.enrichedData;

            state.chart = chart;
        };

        const updateChartData = (data: any[]) => {
            if (state.chart) state.chart.data = data;
        };

        onMounted(() => {
            drawChart();
        });

        const stopDataWatch = watch(() => state.enrichedData, (data) => {
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
.p-dynamic-chart-column {
    width: 100%;
}
</style>
