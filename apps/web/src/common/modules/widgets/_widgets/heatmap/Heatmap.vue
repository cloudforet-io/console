<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    onMounted, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import { init } from 'echarts';
import type { EChartsOption, EChartsType } from 'echarts';
import { HeatmapChart } from 'echarts/charts';
import {
    TooltipComponent, LegendComponent, GridComponent, VisualMapComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { throttle } from 'lodash';

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
    VisualMapComponent,
    HeatmapChart,
    TooltipComponent,
    LegendComponent,
]);

const { widgetState } = useWidget(props, emit);
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

const state = reactive({
    loading: false,
    data: null as Response | null,
    chart: null as null | EChartsType,
    chartData: [],
    chartOptions: {
        xAxis: {
            type: 'category',
            data: ['AmazonEC2', 'AmazonRDS', 'AmazonS3', 'AmazonVPC', 'AmazonRoute53', 'AmazonEC2', 'AmazonRDS', 'AmazonS3', 'AmazonVPC', 'AmazonRoute53'],
        },
        yAxis: {
            type: 'category',
            data: ['project1', 'project2', 'project3', 'project4', 'project5'],
            splitArea: {
                show: true,
            },
            // axisLabel: {
            //     interval: 0,
            // },
        },
        // label: {
        //     show: true,
        //     formatter: '{a}',
        // },
        tooltip: {
            position: 'top',
        },
        visualMap: {
            min: 0,
            max: 10,
            calculable: true,
            orient: 'horizontal',
            left: 'left',
            bottom: 0,
        },
        series: [
            {
                name: 'project',
                type: 'heatmap',
                data: [
                    [0, 0, 5],
                    [0, 1, 1],
                    [0, 2, 6],
                    [0, 3, 10],
                    [0, 4, 20],
                    [1, 0, 2],
                    [1, 1, 1],
                    [1, 2, 7],
                    [1, 3, 11],
                    [1, 4, 2],
                    [2, 0, 3],
                    [2, 1, 4],
                    [2, 2, 8],
                    [2, 3, 12],
                    [2, 4, 0],
                    [3, 0, 4],
                    [3, 1, 6],
                    [3, 2, 9],
                    [3, 3, 13],
                    [3, 4, 5],
                    [4, 0, 5],
                    [4, 1, 7],
                    [4, 2, 10],
                    [4, 3, 15],
                    [4, 4, 40],
                    [5, 0, 6],
                    [5, 1, 8],
                    [5, 2, 11],
                    [5, 3, 17],
                    [5, 4, 4],
                    [6, 0, 7],
                    [6, 1, 9],
                    [6, 2, 12],
                    [6, 3, 18],
                    [6, 4, 0],
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
