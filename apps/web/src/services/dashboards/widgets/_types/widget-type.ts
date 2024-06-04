import type { TranslateResult } from 'vue-i18n';

import type {
    DashboardLayoutWidgetInfo,
    DashboardSettings,
    DashboardVariables,
    DashboardVariablesSchema,
} from '@/schema/dashboard/_types/dashboard-type';
import type {
    InheritOptions,
    WidgetOptions, WidgetSize,
} from '@/schema/dashboard/_types/widget-type';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';

export type UpdatableWidgetInfo = Pick<DashboardLayoutWidgetInfo, 'title'|'inherit_options'|'widget_options'|'schema_properties'>;

// TODO: replace with WidgetProps
export interface WidgetProps<T = any> {
    widgetConfigId: string;
    title?: string;
    options?: WidgetOptions;
    inheritOptions?: InheritOptions;
    schemaProperties?: string[];
    size?: WidgetSize;
    width?: number;
    theme?: WidgetTheme; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    widgetKey: string; // unique widget key to identify widgets in layout
    editMode?: boolean;
    errorMode?: boolean;
    allReferenceTypeInfo: AllReferenceTypeInfo;
    disableFullMode?: boolean;
    disableRefreshOnVariableChange?: boolean;
    dashboardSettings?: DashboardSettings;
    dashboardVariablesSchema?: DashboardVariablesSchema;
    dashboardVariables?: DashboardVariables;
    loading?: boolean;
    data?: T;
}

// TODO: remove this after replacing WidgetProps with WidgetProps
export interface NewWidgetProps {
    widgetConfigId: string;
    widgetInfo: DashboardLayoutWidgetInfo;
    editMode?: boolean;
    errorMode?: boolean;
    disableFullMode?: boolean;
    disableRefreshOnVariableChange?: boolean;
    allReferenceTypeInfo: AllReferenceTypeInfo;
    settings?: DashboardSettings;
    variablesSchema?: DashboardVariablesSchema;
    variables?: DashboardVariables;
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
    label?: TranslateResult|string;
    color?: string;
    disabled?: boolean; // this is used only in widget data table
}


export interface CostAnalyzeResponse<Result> {
    more?: boolean;
    results: Result[];
}

export interface BudgetUsageAnalyzeResponse<Result> {
    more?: boolean;
    results: Result[];
}

export const WIDGET_THEMES = ['violet', 'blue', 'coral', 'yellow', 'green', 'indigo', 'peacock'] as const;
export type WidgetTheme = typeof WIDGET_THEMES[number];
export type WidgetColorSetType = 'basic'|'massive';
