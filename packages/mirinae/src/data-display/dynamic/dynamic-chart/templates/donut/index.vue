<template>
    <div class="p-dynamic-chart-donut">
        <div ref="chartRef"
             class="donut-chart"
        />
        <div class="legend-group">
            <p-status v-for="(item, idx) in filteredData"
                      :key="`${contextKey}-${idx}`"
                      :icon-color="colors[idx]"
            >
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
import type { PropType } from 'vue';
import {
    computed,
    defineComponent, onMounted, onUnmounted,
    reactive, toRefs, watch,
} from 'vue';

import { PieChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_LIMIT_MAP,
    DYNAMIC_CHART_THEMES,
} from '@/data-display/dynamic/dynamic-chart/config';
import { drawPieChart } from '@/data-display/dynamic/dynamic-chart/templates/donut/helper';
import type {
    DynamicChartFieldHandler,
    DynamicChartTemplateProps,
    DynamicChartTheme,
} from '@/data-display/dynamic/dynamic-chart/type';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PStatus from '@/data-display/status/PStatus.vue';
import { getContextKey } from '@/utils/helpers';

import { BASIC_CHART_COLORS } from '@/styles/colorsets';


const getColorSet = (start: number, limit?: number): string[] => {
    if (typeof limit !== 'number') return BASIC_CHART_COLORS;
    const results: string[] = [];
    let idx = start;
    let count = 0;
    while (count <= limit) {
        if (idx >= BASIC_CHART_COLORS.length) idx = 0;
        results.push(BASIC_CHART_COLORS[idx]);
        count++;
        idx++;
    }
    return results;
};

type DynamicChartDonutProps = DynamicChartTemplateProps & { limit: number };
export default defineComponent<DynamicChartDonutProps>({
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
        theme: {
            type: String as PropType<DynamicChartTheme>,
            default: DYNAMIC_CHART_THEMES[0],
        },
        limit: {
            type: Number,
            default: DYNAMIC_CHART_LIMIT_MAP.COLUMN,
        },
    },
    setup(props) {
        const state = reactive({
            filteredData: computed<any[]>(() => {
                if (props.data.length > props.limit) return props.data.slice(0, props.limit);
                return props.data;
            }),
            chart: null as null|PieChart,
            chartRef: null as null|HTMLElement,
            themeColorSetMap: computed<Record<DynamicChartTheme, string[]>>(() => ({
                VIOLET: getColorSet(0, props.limit),
                BLUE: getColorSet(1, props.limit),
                CORAL: getColorSet(2, props.limit),
                YELLOW: getColorSet(3, props.limit),
                GREEN: getColorSet(4, props.limit),
                PEACOCK: getColorSet(5, props.limit),
                RED: getColorSet(6, props.limit),
                INDIGO: getColorSet(7, props.limit),
            })),
            colors: computed<string[]>(() => state.themeColorSetMap[props.theme] ?? state.themeColorSetMap[DYNAMIC_CHART_THEMES[0]]),
            contextKey: getContextKey(),
        });

        const getValue = (item: any): string|number|undefined => getValueByPath(item, props.valueOptions.key) ?? '';

        const disposeChart = () => {
            if (state.chart) state.chart.dispose();
        };

        const drawChart = () => {
            const ctx = state.chartRef;
            if (!ctx) return;

            const chart = am4core.create(ctx, PieChart);

            drawPieChart(chart, props.nameOptions, props.valueOptions, state.colors);

            chart.data = state.filteredData;

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

        const stopDataWatch = watch(() => state.filteredData, (data) => {
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
            > .text {
                @apply flex items-center flex-grow text-gray-900;
                font-size: 0.875rem;
                line-height: 1.43;
                > .name {
                    @apply mb-0;
                    font-size: inherit;
                    color: inherit;
                }
                > .value {
                    @apply ml-auto text-gray-600;
                    font-size: 0.875rem;
                    line-height: 1.5;
                }
            }
        }
    }
}
</style>
