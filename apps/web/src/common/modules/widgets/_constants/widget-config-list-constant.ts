import clusteredColumnChart from '@/common/modules/widgets/_base-widgets/clustered-column-chart/widget-config';
import donutChart from '@/common/modules/widgets/_base-widgets/donut-chart/widget-config';
import lineChart from '@/common/modules/widgets/_base-widgets/line-chart/widget-config';
import numberCard from '@/common/modules/widgets/_base-widgets/number-card/widget-config';
import stackedArea from '@/common/modules/widgets/_base-widgets/stacked-area/widget-config';
import stackedColumnChart from '@/common/modules/widgets/_base-widgets/stacked-column-chart/widget-config';
import table from '@/common/modules/widgets/_base-widgets/table/widget-config';
import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { NewWidgetConfigKey } from '@/common/modules/widgets/types/widget-list-type';


export const NEW_CONSOLE_WIDGET_CONFIG_KEYS = [
    'numberCard',
    'stackedColumnChart',
    'clusteredColumnChart',
    'stackedBarChart',
    'lineChart',
    'donutChart',
    'pieChart',
    'treeMap',
    'heatmap',
    'regionMap',
    'table',
    'stackedArea',
    'guage',
    'progressCard',
] as const;

export const NEW_CONSOLE_WIDGET_CONFIG: Record<NewWidgetConfigKey, Partial<NewWidgetConfig>> = {
    numberCard,
    stackedColumnChart,
    clusteredColumnChart,
    lineChart,
    donutChart,
    stackedArea,
    table,
};
