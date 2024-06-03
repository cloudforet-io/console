<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    onMounted, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import axios from 'axios';
import { init, registerMap } from 'echarts';
import type { EChartsOption, EChartsType } from 'echarts';
import { MapChart } from 'echarts/charts';
import {
    TooltipComponent, LegendComponent, GeoComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { throttle } from 'lodash';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    NewWidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';

import { coral, gray } from '@/styles/colors';


const props = defineProps<NewWidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);

use([
    CanvasRenderer,
    GeoComponent,
    TooltipComponent,
    LegendComponent,
    MapChart,
]);

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);

const state = reactive({
    loading: false,
    data: null as Response | null,
    chart: null as null | EChartsType,
    chartData: [],
    chartOptions: {
        geo: {
            type: 'map',
            map: 'world',
            roam: true,
            label: {
                emphasis: {
                    show: false,
                },
            },
            itemStyle: {
                normal: {
                    areaColor: gray[200],
                    borderColor: gray[600],
                },
                emphasis: {
                    areaColor: gray[400],
                },
            },
        },
        legend: {
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
        },
        series: [
            {
                type: 'scatter',
                coordinateSystem: 'geo',
                data: [
                    {
                        name: 'London',
                        value: [0, 51.5074],
                        itemStyle: {
                            normal: {
                                color: coral[400],
                            },
                        },
                    },
                    { name: 'New York', value: [-74.006, 40.7128] },
                    { name: 'San Francisco', value: [-122.4194, 37.7749] },
                ],
            },
        ],
    } as EChartsOption,
});

onMounted(async () => {
    const response = await axios.get('map/geo-data.json');
    const geoJson = response.data;
    registerMap('world', geoJson);
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
