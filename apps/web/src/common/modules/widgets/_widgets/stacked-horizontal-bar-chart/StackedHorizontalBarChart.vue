<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    onMounted, reactive, ref,
} from 'vue';

import type { BarSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { throttle } from 'lodash';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);

const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Response | null,
    chart: null as null | EChartsType,
    chartData: [],
    chartOptions: {
        legend: {
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
        },
        tooltip: {},
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: ['AmazonEC2', 'AmazonQuickSight', 'AWSELB', 'DocumentDB'] },
        series: [
            {
                name: 'project1',
                type: 'bar',
                stack: 'product',
                barMaxWidth: 50,
                data: [100, 200, 300, 400, 220, 300, 500],
            },
            {
                name: 'project2',
                type: 'bar',
                stack: 'product',
                data: [150, 232, 201, 154, 190, 330, 410],
            },
            {
                name: 'project3',
                type: 'bar',
                stack: 'product',
                data: [23, 200, 24, 400, 220, 45, 500],
            },
            {
                name: 'project4',
                type: 'bar',
                stack: 'product',
                data: [23, 346, 24, 400, 220, 4, 500],
            },
        ],
    } as BarSeriesOption,
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
        <div ref="chartContext"
             class="chart"
        />
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart {
    height: 100%;
}
</style>
