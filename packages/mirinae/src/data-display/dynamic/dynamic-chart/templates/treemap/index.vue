<template>
    <div ref="chartRef"
         class="p-dynamic-chart-treemap"
    />
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    onMounted, onUnmounted,
    reactive, toRefs, watch,
} from 'vue';

import { TreeMap } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { maxBy, minBy, sum } from 'lodash';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_LIMIT_MAP,
    DYNAMIC_CHART_THEMES,
} from '@/data-display/dynamic/dynamic-chart/config';
import { drawTreemapChart } from '@/data-display/dynamic/dynamic-chart/templates/treemap/helper';
import type {
    DynamicChartFieldHandler,
    DynamicChartTemplateProps,
    DynamicChartTheme,
} from '@/data-display/dynamic/dynamic-chart/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

import { palette } from '@/styles/colors.cjs';

const getColoredData = (chartData: any[], theme: DynamicChartTheme, valueOptions: DynamicField): any[] => {
    const results: any[] = [];
    const key = valueOptions.key;

    const maxItem = maxBy(chartData, (d) => d[key] ?? 0);
    const minItem = minBy(chartData, (d) => d[key] ?? 0);
    const max = maxItem ? maxItem[key] ?? 0 : 0;
    const min = minItem ? minItem[key] ?? 0 : 0;

    const tick = Math.floor((max - min) / 4);
    const levels = [tick * 4, tick * 3, tick * 2, tick];

    const color = palette[theme.toLowerCase()] ?? palette.violet;

    chartData.forEach((d) => {
        let backgroundColor;
        let textColor;

        const value = (d[key] ?? 0) - min;
        if (value >= levels[0]) {
            textColor = palette.white;
            backgroundColor = color[700];
        } else if (value > levels[1]) {
            textColor = palette.white;
            backgroundColor = color[500];
        } else if (value > levels[2]) {
            textColor = palette.white;
            backgroundColor = color[400];
        } else if (value > levels[3]) {
            textColor = palette.gray[900];
            backgroundColor = color[300];
        } else {
            textColor = palette.gray[900];
            backgroundColor = color[200];
        }

        results.push({
            ...d,
            backgroundColor,
            textColor,
        });
    });
    return results;
};

type DynamicChartTreemapProps = DynamicChartTemplateProps & { limit: number };
export default defineComponent<DynamicChartTreemapProps>({
    name: 'PDynamicChartTreemap',
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
        fieldHandler: {
            type: Function as PropType<DynamicChartFieldHandler|undefined>,
            default: undefined,
        },
        theme: {
            type: String as PropType<DynamicChartTheme>,
            default: DYNAMIC_CHART_THEMES[0],
        },
        limit: {
            type: Number,
            default: DYNAMIC_CHART_LIMIT_MAP.TREEMAP,
        },
    },
    setup(props) {
        const state = reactive({
            chart: null as null|TreeMap,
            chartRef: null as null|HTMLElement,
            filteredData: computed<any[]>(() => {
                if (props.data.length > props.limit) return props.data.slice(0, props.limit);
                return props.data;
            }),
        });

        const disposeChart = () => {
            if (state.chart) {
                state.chart.dispose();
                state.chart = null;
            }
        };

        const drawChart = () => {
            const ctx = state.chartRef;
            if (!ctx) return;

            const chart = am4core.create(ctx, TreeMap);

            const totalValue = sum(state.filteredData.map((d) => d[props.valueOptions.key] ?? 0));
            drawTreemapChart(chart, props.nameOptions, props.valueOptions, totalValue);
            state.chart = chart;

            state.chart.data = getColoredData(state.filteredData, props.theme, props.valueOptions);
        };

        const updateChartData = (data: any[]) => {
            if (state.chart) state.chart.data = data;
        };

        onMounted(() => {
            drawChart();
        });

        const stopDataWatch = watch([() => state.filteredData, () => props.theme], ([data, theme]) => {
            updateChartData(getColoredData(data as any[], theme as DynamicChartTheme, props.valueOptions));
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
.p-dynamic-chart-treemap {
    width: 100%;
}
</style>
