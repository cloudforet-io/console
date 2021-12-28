import { DynamicField, DynamicFieldOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { DYNAMIC_CHART_TYPE } from '@/data-display/dynamic/dynamic-chart/config';
import { DynamicFieldHandler, DynamicFieldTypeOptions } from '@/data-display/dynamic/dynamic-field/type';

export type DynamicChartType = typeof DYNAMIC_CHART_TYPE[number]

export type DynamicChartFieldHandler<T = undefined> = DynamicFieldHandler<
    DynamicFieldOptions,
    DynamicFieldTypeOptions,
    DynamicField & T
    >

export interface DynamicChartTemplateProps<T=any> {
    data: T[];
    valueOptions: DynamicField;
    nameOptions: DynamicField;
}

export interface DynamicChartProps<T=any> extends DynamicChartTemplateProps<T> {
    type: DynamicChartType;
    loading: boolean;
    limit: number;
}
