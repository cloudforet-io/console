<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    onMounted, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import { init } from 'echarts';
import type { EChartsOption, EChartsType } from 'echarts';
import { GaugeChart } from 'echarts/charts';
import {
    TooltipComponent, LegendComponent, GridComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { throttle } from 'lodash';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);

use([
    CanvasRenderer,
    GridComponent,
    GaugeChart,
    TooltipComponent,
    LegendComponent,
]);

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);

const state = reactive({
    loading: false,
    data: null as Response | null,
    chart: null as null | EChartsType,
    chartData: [],
    chartOptions: {
        series: [
            {
                type: 'gauge',
                center: ['50%', '60%'],
                startAngle: 200,
                endAngle: -20,
                min: 0,
                // max: 150,
                // splitNumber: 12,
                itemStyle: {
                    color: '#FFAB91',
                },
                progress: {
                    show: true,
                    width: 10,
                },
                pointer: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        width: 10,
                    },
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: false,
                    distance: -15,
                },
                axisLabel: {
                    distance: -15,
                    color: '#999',
                    fontSize: 12,
                },
                anchor: {
                    show: false,
                },
                detail: {
                    valueAnimation: true,
                    width: '60%',
                    lineHeight: 0,
                    borderRadius: 8,
                    offsetCenter: [0, '-15%'],
                    fontSize: 30,
                    fontWeight: 'bolder',
                    formatter: '{value}',
                    color: 'inherit',
                },
                data: [
                    {
                        value: 20,
                    },
                ],
            },
        ],
    } as EChartsOption,
});

onMounted(() => {
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions);
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <p-data-loader class="chart-loader"
                       :loading="state.loading"
                       loader-type="skeleton"
                       disable-empty-case
                       :loader-backdrop-opacity="1"
                       show-data-from-scratch
        >
            <div ref="chartContext"
                 class="chart"
            />
        </p-data-loader>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart-loader {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
