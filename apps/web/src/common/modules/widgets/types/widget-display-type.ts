import type { TranslateResult } from 'vue-i18n';

import type {
    DashboardLayoutWidgetInfo,
} from '@/schema/dashboard/_types/dashboard-type';

import type { WIDGET_SIZE } from '@/common/modules/widgets/_constants/widget-display-constant';
import type { WidgetFieldName } from '@/common/modules/widgets/types/widget-field-type';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';


export type UpdatableWidgetInfo = Pick<DashboardLayoutWidgetInfo, 'title'|'inherit_options'|'widget_options'|'schema_properties'>;

export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];

export interface WidgetProps {
    widgetName: string;
    widgetId: string;
    dataTableId: string;
    title?: string;
    description?: string;
    size?: WidgetSize;
    width?: number;
    widgetOptions?: Record<WidgetFieldName, WidgetFieldValues>;
    //
    mode?: 'overlay'|'customize'|'view';
    // filters?: NewWidgetFilters;
    // filtersSchemaProperties?: string[];
    // theme?: WidgetTheme; // e.g. 'violet', 'coral', 'peacock', ... default: violet
    // editMode?: boolean;
    // errorMode?: boolean;
    // baseOnDate?: string;
    // variablesSchema?: DashboardVariablesSchema;
    // variables?: DashboardVariables;
    // loading?: boolean;
    // dataSources: DataSource[];
    // dataMapping: DataMapping;
    // chartOptions: Record<string, any>;
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
    (event: 'update:size', size: WidgetSize): void;
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
