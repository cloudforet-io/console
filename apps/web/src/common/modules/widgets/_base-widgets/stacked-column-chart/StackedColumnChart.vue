<script setup lang="ts">
import {
    reactive,
} from 'vue';
import VChart from 'vue-echarts';

import type { XYChart } from '@amcharts/amcharts5/xy';
import { PieChart } from 'echarts/charts';
import {
    TooltipComponent, LegendComponent,
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

// const chartContext = ref<HTMLElement|null>(null);
// const chartHelper = useAmcharts5(chartContext);

use([
    CanvasRenderer,
    PieChart,
    TooltipComponent,
    LegendComponent,
]);

const { widgetState } = useWidget(props, emit);
// const { widgetChartState } = useWidgetChart(props);
// const { widgetDataState } = useWidgetDataState(props);
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, widgetState);

const state = reactive({
    loading: true,
    data: null as Response | null,
    chart: null as null | XYChart,
    chartData: [],
    chartOptions: {
        title: {
            text: 'Traffic Sources',
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'right',
            data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
        },
        series: [
            {
                name: 'Traffic Sources',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: [
                    { value: 335, name: 'Direct' },
                    { value: 310, name: 'Email' },
                    { value: 234, name: 'Ad Networks' },
                    { value: 135, name: 'Video Ads' },
                    { value: 1548, name: 'Search Engines' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    },
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <v-chart class="chart"
                 :option="state.chartOptions"
                 autoresize
        />
    </widget-frame>
</template>

<style lang="postcss" scoped>
.data-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    .chart {
        height: 12rem;
    }
    .chart-loader {
        height: 12rem;
    }
}
</style>
