import verticalBarChart from '@/common/modules/widgets/_base-widgets/vertical-bar-chart/widget-config';
import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { NewWidgetConfigKey } from '@/common/modules/widgets/types/widget-list-type';


export const NEW_CONSOLE_WIDGET_CONFIG_KEYS = [
    'number',
    'verticalBarChart',
    'lineChart',
    'donutChart',
    'treeMap',
    'heatmap',
    'regionMap',
    'table',
    'area',
    'guage',
    'progress',
];

export const NEW_CONSOLE_WIDGET_CONFIG: Record<NewWidgetConfigKey, Partial<NewWidgetConfig>> = {
    verticalBarChart,
};
