<script setup lang="ts">
import {
    computed,
    reactive, ref, watch,
} from 'vue';

import type { PieChart, IPieSeriesSettings } from '@amcharts/amcharts5/percent';
import { PDataLoader } from '@spaceone/design-system';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    NewWidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';

const props = defineProps<NewWidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);


const state = reactive({
    loading: true,
    data: null as any | null,
    chart: null as null | PieChart,
    chartData: computed(() => {
        if (!state.data?.results) return [];
        return state.data?.results;
    }),
    // legends: computed<Legend[]>(() => {
    //     const data = state.data?.results ?? [];
    //     const legends: Legend[] = getXYChartLegends(data, widgetState.parsedDataField, props.allReferenceTypeInfo);
    //     return legends;
    // }),
});
// const { widgetState } = useWidget(props, emit);
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);
/* Util */
const drawChart = (chartData: any[]) => {
    const seriesSettings: IPieSeriesSettings = {
        categoryField: 'category', // here
        valueField: 'value', // here
    };

    if (!chartHelper.root.value) return;

    const chart = chartHelper.createDonutChart({
        innerRadius: 45,
        x: chartHelper.percent(-25),
        layout: undefined,
    });
    const series = chartHelper.createPieSeries(seriesSettings);
    chart.series.push(series);
    series.data.setAll(chartData);

    const chartLegend = chartHelper.createLegend({
        x: chartHelper.percent(75),
        y: chartHelper.percent(50),
        centerY: chartHelper.percent(50),
        layout: chartHelper.root.value.verticalLayout,
        height: chartHelper.percent(100),
        verticalScrollbar: chartHelper.verticalScrollbarSetting({
            orientation: 'vertical',
        }),
    });
    const legend = chart.children.push(chartLegend);
    legend.labels.template.setAll({
        width: 148,
        maxWidth: 128,
        oversizedBehavior: 'truncate',
        ellipsis: '...',
    });
    legend.valueLabels.template.setAll({
        fontSize: 12,
    });
    legend.data.setAll(series.dataItems);

    state.chart = chart;
};

const initWidget = async () => {
    state.loading = true;
    // TODO: data source를 돌며 fetchData
    state.data = {
        results: [
            { category: 'google cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloud', value: 5000 },
            { category: 'aws', value: 1000 },
            { category: 'azure', value: 1000 },
            { category: 'alibaba', value: 1000 },
            { category: 'google cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloud', value: 5000 },
            { category: 'aws', value: 1000 },
            { category: 'azure', value: 1000 },
            { category: 'alibaba', value: 1000 },
            { category: 'google cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloudgoogle cloud', value: 5000 },
            { category: 'aws', value: 1000 },
            { category: 'azure', value: 1000 },
            { category: 'alibaba', value: 1000 },
        ],
    };
    // await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
};
//
// const refreshWidget = async (_thisPage = 1): Promise<Response> => {
//     await nextTick();
//     state.loading = true;
//     thisPage.value = _thisPage;
//     state.data = await fetchData();
//     chartHelper.refreshRoot();
//     await nextTick();
//     if (chartHelper.root.value) drawChart(state.chartData);
//     state.loading = false;
//     return state.data;
// };

// useWidgetLifecycle({
//     disposeWidget: chartHelper.disposeRoot,
//     initWidget,
//     refreshWidget,
//     props,
//     emit,
//     widgetState,
//     onCurrencyUpdate: async () => {
//         if (!state.data) return;
//         chartHelper.refreshRoot();
//         await nextTick();
//         if (chartHelper.root.value) drawChart(state.chartData);
//     },
// });

// defineExpose<WidgetExpose<Response>>({
//     initWidget,
//     refreshWidget,
// });

watch(() => chartHelper.root.value, () => {
    initWidget();
}, {
    immediate: true,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="data-container">
            <div v-if="state.data?.results?.length"
                 class="chart-wrapper"
            >
                <p-data-loader class="chart-loader"
                               :data="state.chartData"
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
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.data-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    .chart-wrapper {
        height: 15.875rem;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
