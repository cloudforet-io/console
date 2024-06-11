<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    onMounted, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import type { TreemapSeriesOption } from 'echarts/charts';
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
        series: [
            {
                type: 'treemap',
                nodeClick: false,
                breadcrumb: {
                    show: false,
                },
                label: {
                    fontSize: 12,
                },
                data: [
                    {
                        name: 'AWS',
                        value: 103,
                    },
                    {
                        name: 'Google Cloud',
                        value: 64,
                    },
                    {
                        name: 'Azure',
                        value: 21,
                    },
                    {
                        name: 'Alibaba Cloud',
                        value: 2,
                    },
                ],
            },
        ],
    } as TreemapSeriesOption,
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
