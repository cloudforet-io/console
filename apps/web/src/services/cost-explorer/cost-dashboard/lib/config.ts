import Layout1WidgetList from '@/services/cost-explorer/cost-dashboard/dashboard-layouts/layout-1.json';
import Layout4WidgetList from '@/services/cost-explorer/cost-dashboard/dashboard-layouts/layout-4.json';
import type { DefaultLayout } from '@/services/cost-explorer/cost-dashboard/type';
import { CHART_TYPE } from '@/services/cost-explorer/cost-dashboard/type';

export const defaultLayoutMap = {
    'layout-1': {
        default_layout_id: 'layout-1',
        name: 'Monthly Cost Summary',
        widgetList: Layout1WidgetList,
    },
    'layout-4': {
        default_layout_id: 'layout-4',
        name: 'CDN & Traffic Cost',
        widgetList: Layout4WidgetList,
    },
};
export const defaultLayoutList: Record<string, DefaultLayout> = {
    ...{ blank: { name: 'Blank', widgetList: [] } },
    ...{ 'layout-1': { ...defaultLayoutMap['layout-1'] } },
    ...{ 'layout-4': { ...defaultLayoutMap['layout-4'] } },
};
export const defaultLayoutData = Object.values(defaultLayoutList);

export const chartTypeItemMap = Object.freeze({
    [CHART_TYPE.CARD]: {
        name: CHART_TYPE.CARD, label: 'Card', imageFileName: 'widget_card',
    },
    [CHART_TYPE.TREEMAP]: {
        name: CHART_TYPE.TREEMAP, label: 'Treemap Chart', imageFileName: 'widget_treemap',
    },
    [CHART_TYPE.MAP]: {
        name: CHART_TYPE.MAP, label: 'Map Chart', imageFileName: 'widget_geomap',
    },
    [CHART_TYPE.LINE]: {
        name: CHART_TYPE.LINE, label: 'Line Chart', imageFileName: 'widget_line',
    },
    [CHART_TYPE.STACKED_COLUMN]: {
        name: CHART_TYPE.STACKED_COLUMN, label: 'Stacked Column Chart', imageFileName: 'widget_stacked_column',
    },
    [CHART_TYPE.DONUT]: {
        name: CHART_TYPE.DONUT, label: 'Donut Chart', imageFileName: 'widget_donut',
    },
    [CHART_TYPE.PIE]: {
        name: CHART_TYPE.PIE, label: 'Pie Chart', imageFileName: 'widget_pie',
    },
    [CHART_TYPE.WAFFLE]: {
        name: CHART_TYPE.WAFFLE, label: 'Waffle Chart', imageFileName: 'widget_waffle',
    },
    [CHART_TYPE.TABLE]: {
        name: CHART_TYPE.TABLE, label: 'Table', imageFileName: 'widget_table',
    },
});

export const DASHBOARD_TYPE = Object.freeze({
    PUBLIC: 'public',
    USER: 'user',
} as const);
