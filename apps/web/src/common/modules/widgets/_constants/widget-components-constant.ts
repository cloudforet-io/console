import type { AsyncComponent } from 'vue';

import type { WidgetConfigKey } from '@/common/modules/widgets/types/widget-list-type';


export const WIDGET_COMPONENTS: Record<WidgetConfigKey, AsyncComponent> = {
    numberCard: () => ({
        component: import('@/common/modules/widgets/_widgets/number-card/NumberCard.vue'),
    }),
    stackedColumnChart: () => ({
        component: import('@/common/modules/widgets/_widgets/stacked-column-chart/StackedColumnChart.vue'),
    }),
    clusteredColumnChart: () => ({
        component: import('@/common/modules/widgets/_widgets/clustered-column-chart/ClusteredColumnChart.vue'),
    }),
    stackedHorizontalBarChart: () => ({
        component: import('@/common/modules/widgets/_widgets/stacked-horizontal-bar-chart/StackedHorizontalBarChart.vue'),
    }),
    lineChart: () => ({
        component: import('@/common/modules/widgets/_widgets/line-chart/LineChart.vue'),
    }),
    pieChart: () => ({
        component: import('@/common/modules/widgets/_widgets/pie-chart/PieChart.vue'),
    }),
    treemap: () => ({
        component: import('@/common/modules/widgets/_widgets/treemap/Treemap.vue'),
    }),
    heatmap: () => ({
        component: import('@/common/modules/widgets/_widgets/heatmap/Heatmap.vue'),
    }),
    geoMap: () => ({
        component: import('@/common/modules/widgets/_widgets/geo-map/GeoMap.vue'),
    }),
    table: () => ({
        component: import('@/common/modules/widgets/_widgets/table/Table.vue'),
    }),
    stackedAreaChart: () => ({
        component: import('@/common/modules/widgets/_widgets/stacked-area-chart/StackedAreaChart.vue'),
    }),
    gauge: () => ({
        component: import('@/common/modules/widgets/_widgets/gauge/Gauge.vue'),
    }),
    progressCard: () => ({
        component: import('@/common/modules/widgets/_widgets/progress-card/ProgressCard.vue'),
    }),
};

export const WIDGET_COMPONENT_ICON_MAP: Record<WidgetConfigKey, string> = {
    numberCard: 'ic_chart-number-card',
    stackedColumnChart: 'ic_chart-stacked-column',
    clusteredColumnChart: 'ic_chart-clustered-column',
    stackedHorizontalBarChart: 'ic_chart-stacked-horizontal-bar',
    lineChart: 'ic_chart-line',
    pieChart: 'ic_chart-pie',
    treemap: 'ic_chart-treemap',
    heatmap: 'ic_chart-heatmap',
    geoMap: 'ic_chart-geomap',
    table: 'ic_chart-table',
    stackedAreaChart: 'ic_chart-area',
    gauge: 'ic_chart-gauge',
    progressCard: 'ic_chart-progress-card',
};
