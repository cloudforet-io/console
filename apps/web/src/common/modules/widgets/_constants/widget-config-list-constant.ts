import numberCard from '@/common/modules/widgets/_base-widgets/number-card/widget-config';
import stackedColumnChart from '@/common/modules/widgets/_base-widgets/stacked-column-chart/widget-config';
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
    stackedColumnChart,
    numberCard,
};
