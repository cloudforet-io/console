import clusteredColumnChart from '@/common/modules/widgets/_base-widgets/clustered-column-chart/widget-config';
import gauge from '@/common/modules/widgets/_base-widgets/gauge/widget-config';
import geoMap from '@/common/modules/widgets/_base-widgets/geo-map/widget-config';
import heatmap from '@/common/modules/widgets/_base-widgets/heatmap/widget-config';
import lineChart from '@/common/modules/widgets/_base-widgets/line-chart/widget-config';
import numberCard from '@/common/modules/widgets/_base-widgets/number-card/widget-config';
import pieChart from '@/common/modules/widgets/_base-widgets/pie-chart/widget-config';
import progressCard from '@/common/modules/widgets/_base-widgets/progress-card/widget-config';
import stackedAreaChart from '@/common/modules/widgets/_base-widgets/stacked-area-chart/widget-config';
import stackedColumnChart from '@/common/modules/widgets/_base-widgets/stacked-column-chart/widget-config';
import stackedHorizontalBarChart from '@/common/modules/widgets/_base-widgets/stacked-horizontal-bar-chart/widget-config';
import table from '@/common/modules/widgets/_base-widgets/table/widget-config';
import treemap from '@/common/modules/widgets/_base-widgets/treemap/widget-config';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { WidgetConfigKey } from '@/common/modules/widgets/types/widget-list-type';


export const CONSOLE_WIDGET_CONFIG_KEYS = [
    'numberCard',
    'stackedColumnChart',
    'clusteredColumnChart',
    'stackedHorizontalBarChart',
    'lineChart',
    'pieChart',
    'treemap',
    'heatmap',
    'geoMap',
    'table',
    'stackedAreaChart',
    'gauge',
    'progressCard',
] as const;

export const CONSOLE_WIDGET_CONFIG: Record<WidgetConfigKey, Partial<WidgetConfig>> = {
    numberCard,
    stackedColumnChart,
    clusteredColumnChart,
    stackedHorizontalBarChart,
    lineChart,
    pieChart,
    treemap,
    heatmap,
    geoMap,
    table,
    stackedAreaChart,
    gauge,
    progressCard,
};
