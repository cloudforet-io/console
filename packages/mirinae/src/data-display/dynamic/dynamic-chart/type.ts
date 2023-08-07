import type { DYNAMIC_CHART_TYPE, DYNAMIC_CHART_THEMES } from '@/data-display/dynamic/dynamic-chart/config';
import type { DynamicFieldHandler, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField, DynamicFieldOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export type DynamicChartType = typeof DYNAMIC_CHART_TYPE[number];

export type DynamicChartFieldHandler<T = any> = DynamicFieldHandler<
    DynamicFieldOptions,
    DynamicFieldTypeOptions,
    DynamicField & T
    >;

export type DynamicChartTheme = typeof DYNAMIC_CHART_THEMES[number];
export interface DynamicChartTemplateProps<Data=any> {
    data: Data[];
    valueOptions: DynamicField;
    nameOptions: DynamicField;
    fieldHandler?: DynamicChartFieldHandler;
    theme: DynamicChartTheme;
    limit?: number;
}

export interface DynamicChartProps<T=any> extends DynamicChartTemplateProps<T> {
    type: DynamicChartType;
    loading: boolean;
}
