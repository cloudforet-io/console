import type { TranslateResult } from 'vue-i18n';

import type {
    DashboardLayoutWidgetInfo,
    DashboardVariables,
    DashboardVariablesSchema, DataSource,
} from '@/schema/dashboard/_types/dashboard-type';
import type {
    WidgetSize, NewWidgetFilters,
} from '@/schema/dashboard/_types/widget-type';


export type UpdatableWidgetInfo = Pick<DashboardLayoutWidgetInfo, 'title'|'inherit_options'|'widget_options'|'schema_properties'>;

export interface NewWidgetProps {
    widgetName: string;
    title?: string;
    description?: string;
    size?: WidgetSize;
    filters?: NewWidgetFilters;
    filtersSchemaProperties?: string[];
    width?: number;
    theme?: WidgetTheme; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    widgetKey: string; // unique widget key to identify widgets in layout
    editMode?: boolean;
    errorMode?: boolean;
    baseOnDate?: string;
    variablesSchema?: DashboardVariablesSchema;
    variables?: DashboardVariables;
    loading?: boolean;
    dataSources: DataSource[];
    dataMapping: Record<string, string|string[]>;
    chartOptions: Record<string, any>;
}

export interface WidgetEmit {
    (e: 'mounted'): void;
    (e: 'initiated', data: any): void;
    (e: 'refreshed', data: any): void;
    (e: 'update-widget-info', widgetInfo: UpdatableWidgetInfo): void;
    (e: 'update-widget-validation', validation: boolean): void;
    (event: 'click-delete'): void;
    (event: 'click-expand'): void;
    (event: 'click-edit'): void;
}

export interface WidgetExpose<Data = any> {
    initWidget: (data?: Data) => Promise<Data>;
    refreshWidget: () => Promise<Data>;
}


export interface Legend {
    name: string;
    label?: TranslateResult;
    color?: string;
    disabled?: boolean; // this is used only in widget data table
}

export const WIDGET_THEMES = ['violet', 'blue', 'coral', 'yellow', 'green', 'indigo', 'peacock'] as const;
export type WidgetTheme = typeof WIDGET_THEMES[number];
export type WidgetColorSetType = 'basic'|'massive';
