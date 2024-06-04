<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, onMounted,
    reactive, ref,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import type { EChartsOption, EChartsType } from 'echarts';
import { init } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
    DatasetComponent, GridComponent, LegendComponent, TooltipComponent,
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
    DatasetComponent,
    LineChart,
    TooltipComponent,
    LegendComponent,
]);

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);
const state = reactive({
    loading: true,
    data: null as any | null,
    chart: null as null | EChartsType,
    chartData: computed(() => {
        if (!state.data?.results) return [];
        return state.data?.results;
    }),
    chartOptions: computed<EChartsOption>(() => ({
        tooltip: {
            trigger: 'item',
            position: 'inside',
        },
        grid: {
            containLabel: true,
        },
        legend: {
            orient: 'vertical',
            type: 'scroll',
            right: 10,
            top: 20,
            bottom: 20,
            icon: 'circle',
            textStyle: {
                overflow: 'truncate',
                width: 150,
            },
            formatter: (name: string) => {
                const series = state.chart.getOption().series[0];
                const value = series.data.filter((row) => row.name === name)[0].value;
                return `${(name.length > 10 ? `${name.slice(0, 10)}...` : name)}     ${value}`;
            },
        },
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: ['30%', '70%'],
                center: ['30%', '50%'],
                data: state.chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
            },
        ],
    })),
});

/* Util */
const initWidget = async () => {
    state.loading = true;
    // TODO: data source를 돌며 fetchData
    state.data = {
        results: [
            { name: 'google cloudgoogle cloudgoogle cloudgoogle ', value: 5000 },
            { name: 'aws', value: 1000 },
            { name: 'azure', value: 1000 },
            { name: 'alibaba', value: 1000 },
            { name: '22google cloudgoogle cloudgoogle cloudgoogle ', value: 5000 },
            { name: '2aws', value: 1000 },
            { name: '2azure', value: 1000 },
            { name: '2alibaba', value: 1000 },
            { name: '3google cloudgoogle cloudgoogle cloudgoogle ', value: 5000 },
            { name: '3aws', value: 1000 },
            { name: '3azure', value: 1000 },
            { name: '3alibaba', value: 1000 },
            { name: '4google cloudgoogle cloudgoogle cloudgoogle ', value: 5000 },
            { name: '4aws', value: 1000 },
            { name: '4azure', value: 1000 },
            { name: '4alibaba', value: 1000 },
        ],
    };
    // await nextTick();
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions);
    state.loading = false;
};

onMounted(() => {
    initWidget();
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
                       loader-type="skeleton"
                       disable-empty-case
                       :loading="state.loading"
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
