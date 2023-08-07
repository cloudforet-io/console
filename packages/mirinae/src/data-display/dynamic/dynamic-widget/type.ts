import type { DynamicChartType } from '@/data-display/dynamic/dynamic-chart/type';
import type { DynamicFieldHandler, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField, DynamicFieldOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const DYNAMIC_WIDGET_TYPE = ['summary', 'chart'] as const;
export type DynamicWidgetType = typeof DYNAMIC_WIDGET_TYPE[number];

/* SpaceONE Dynamic Widget Schema Spec */
export interface DynamicWidgetSchemaOptions {
    value_options?: DynamicField;
    name_options?: DynamicField;
    chart_type?: DynamicChartType;
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

export type DynamicWidgetFieldHandler<T = any> = DynamicFieldHandler<
    DynamicFieldOptions,
    DynamicFieldTypeOptions,
    DynamicField & T
    >;


export interface DynamicWidgetProps<T=any> {
    index: number;
    // data from schema
    type: DynamicWidgetType;
    name: string;
    schemaOptions: DynamicWidgetSchemaOptions;
    // other data
    data: T;
    loading: boolean;
    viewOptions: DynamicWidgetViewOptions;
    fieldHandler?: DynamicWidgetFieldHandler;
}
