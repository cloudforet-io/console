<script setup lang="ts">
import {
    onMounted, reactive, ref,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import {
    PDataLoader,
} from '@spaceone/design-system';
import { init } from 'echarts';
import type { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
    TooltipComponent, LegendComponent, GridComponent, DatasetComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidget } from '@/common/modules/widgets/_composables/use-widget/use-widget';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    NewWidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


const props = defineProps<NewWidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);

use([
    CanvasRenderer,
    GridComponent,
    DatasetComponent,
    LineChart,
    TooltipComponent,
    LegendComponent,
]);

const { widgetState } = useWidget(props, emit);
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

const state = reactive({
    loading: false,
    data: null as Response | null,
    chart: null as null | XYChart,
    chartData: [],
    chartOptions: {
        legend: {
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['AmazonEC2', 'AmazonQuickSight', 'AWSELB', 'DocumentDB'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                name: 'project1',
                type: 'line',
                stack: 'total',
                areaStyle: {},
                data: [100, 200, 300, 400, 220, 300, 500],
            },
            {
                name: 'project2',
                type: 'line',
                stack: 'total',
                areaStyle: {},
                data: [150, 232, 201, 154, 190, 330, 410],
            },
            {
                name: 'project3',
                type: 'line',
                stack: 'total',
                areaStyle: {},
                data: [23, 200, 24, 400, 220, 45, 500],
            },
            {
                name: 'project4',
                type: 'line',
                stack: 'total',
                areaStyle: {},
                label: {
                    show: true,
                    position: 'top',
                },
                data: [23, 346, 24, 400, 220, 4, 500],
            },
        ],
    } as EChartsOption,
});

onMounted(() => {
    init(chartContext.value).setOption(state.chartOptions);
});
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
