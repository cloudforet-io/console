import type { AsyncComponent } from 'vue';

import type { WidgetConfigKey } from '@/common/modules/widgets/types/widget-list-type';


export const WIDGET_COMPONENTS: Record<WidgetConfigKey, AsyncComponent> = {
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
    // table: () => ({
    //     component: import('@/common/modules/widgets/_widgets/table/Table.vue'),
    // }),
    stackedAreaChart: () => ({
        component: import('@/common/modules/widgets/_widgets/stacked-area-chart/StackedAreaChart.vue'),
    }),
    gauge: () => ({
        component: import('@/common/modules/widgets/_widgets/gauge/Gauge.vue'),
    }),
    // progressCard: () => ({
    //     component: import('@/common/modules/widgets/_widgets/progress-card/ProgressCard.vue'),
    // }),
};
