import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { DynamicChartType } from '@/data-display/dynamic/dynamic-chart/type';

export const DYNAMIC_WIDGET_TYPE = ['card', 'chart'] as const;
export type DynamicWidgetType = typeof DYNAMIC_WIDGET_TYPE[number];

/* SpaceONE Dynamic Widget Schema Spec */
export interface DynamicWidgetSchemaOptions {
    value_options?: DynamicField;
    name_options?: DynamicField;
    chart_type?: DynamicChartType;
    limit?: number;
}

export interface DynamicWidgetSchema<Query=object> {
    type: DynamicWidgetType;
    name: string;
    options: DynamicWidgetSchemaOptions;
    query?: Query;
}

/* Component Spec */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DynamicWidgetViewOptions {
    // TODO
}

export interface DynamicWidgetProps<T=any> {
    // data from schema
    type: DynamicWidgetType;
    name: string;
    schemaOptions: DynamicWidgetSchemaOptions;
    // other data
    data: T;
    loading: boolean;
    viewOptions: DynamicWidgetViewOptions;
}
