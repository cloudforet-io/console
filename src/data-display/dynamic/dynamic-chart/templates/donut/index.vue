<template>
    <div class="p-dynamic-chart-donut">
        <div ref="chartRef" class="donut-chart" />
        <div class="legend-group">
            <p-status v-for="(item, idx) in data" :key="`${contextKey}-${idx}`" :icon-color="colors[idx]">
                <span class="name">
                    <p-dynamic-field :type="nameOptions.type"
                                     :data="getValueByPath(item, nameOptions.key)"
                                     :options="nameOptions.options"
                                     :extra-data="nameOptions"
                                     :handler="fieldHandler"
                    />
                </span>
                <span class="value">
                    <p-dynamic-field :type="valueOptions.type"
                                     :data="getValue(item)"
                                     :options="valueOptions.options"
                                     :extra-data="valueOptions"
                                     :handler="fieldHandler"
                    />
                </span>
            </p-status>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, onMounted, onUnmounted, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import * as am4core from '@amcharts/amcharts4/core';
import { PieChart } from '@amcharts/amcharts4/charts';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS,
} from '@/data-display/dynamic/dynamic-chart/config';

import { DynamicChartFieldHandler, DynamicChartTemplateProps } from '@/data-display/dynamic/dynamic-chart/type';
import { drawPieChart } from '@/data-display/dynamic/dynamic-chart/templates/donut/helper';
import PStatus from '@/data-display/status/PStatus.vue';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { commaFormatter, getContextKey } from '@/util/helpers';


export default defineComponent<DynamicChartTemplateProps>({
    name: 'PDynamicChartDonut',
    components: { PDynamicField, PStatus },
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
    },
    setup(props) {
        const state = reactive({
            chart: null as null|PieChart,
            chartRef: null as null|HTMLElement,
            colors: DEFAULT_CHART_COLORS,
            contextKey: getContextKey(),
        });

        const getValue = (item: any): string|number|undefined => {
            const value = getValueByPath(item, props.valueOptions.key);
            if (typeof value === 'number') return commaFormatter(value) ?? '';
            return '';
        };

        const disposeChart = () => {
            if (state.chart) state.chart.dispose();
        };

        const drawChart = () => {
            const ctx = state.chartRef;
            if (!ctx) return;

            const chart = am4core.create(ctx, PieChart);

            drawPieChart(chart, props.nameOptions, props.valueOptions);

            chart.data = props.data;

            state.chart = chart;
        };

        const updateChartData = (data: any[]) => {
            if (state.chart) {
                state.chart.data = data;
            }
        };

        onMounted(() => {
            drawChart();
        });

        const stopDataWatch = watch(() => props.data, (data) => {
            state.contextKey = getContextKey();
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
            getValueByPath,
            getValue,
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
