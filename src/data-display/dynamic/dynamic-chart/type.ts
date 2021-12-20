import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { DYNAMIC_CHART_TYPE } from '@/data-display/dynamic/dynamic-chart/config';

export type DynamicChartType = typeof DYNAMIC_CHART_TYPE[number]

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
