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
import { BarChart } from 'echarts/charts';
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


// const dataSourceFetcherMap = {
//     'cost_analysis.Cost': SpaceConnector.clientV2.costAnalysis.cost.analyze,
//     'cost_analysis.BudgetUsage': SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze,
//     'inventory.MetricData': SpaceConnector.clientV2.inventory.metricData.analyze,
// };

// interface SubData { date: string; value: number }
// interface Data {
//     value_sum: SubData[];
//     _total_value_sum: number;
//     [parsedDataField: string]: any; // provider: aws or provider: azure
// }
// interface ChartData {
//     date: string;
//     [parsedDataField: string]: any; // e.g. aws: 12333 or azure: 1234
// }
// type Response = CostAnalyzeResponse<Data>;

// const DATE_FORMAT = 'YYYY-MM';
// const DATE_FIELD_NAME = 'date';

const props = defineProps<NewWidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);

use([
    CanvasRenderer,
    GridComponent,
    DatasetComponent,
    BarChart,
    TooltipComponent,
    LegendComponent,
]);

const { widgetState } = useWidget(props, emit);
// const { widgetChartState } = useWidgetChart(props);
// const { widgetDataState } = useWidgetDataState(props);
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
        tooltip: {},
        xAxis: { type: 'category', data: ['AmazonEC2', 'AmazonQuickSight', 'AWSELB', 'DocumentDB'] },
        yAxis: { type: 'value' },
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
