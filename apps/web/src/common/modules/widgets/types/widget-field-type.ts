import type { Granularity } from '@/schema/dashboard/_types/widget-type';

import type { FORMAT_RULE_TYPE } from '@/common/modules/widgets/configs/widget-field-config';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';


export interface DataFieldOptions {
    multiSelectable?: boolean;
}
export interface TableDataFieldOptions {
    max?: number;
    default: number;
}
export interface XAxisOptions {
    dataTarget?: string;
    max?: number;
    default: number;
}
export interface YAxisOptions {
    dataTarget?: string;
    max?: number;
    default: number;
}
export interface LineByOptions {
    dataTarget?: string;
    max?: number;
    default: number;
}
export interface StackByOptions {
    dataTarget?: string;
    max?: number;
    default: number;
}
export interface GroupByOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
    hideCount?: boolean;
    max?: number;
    default?: number;
}
export interface CategoryByOptions {
    dataTarget?: string;
    max?: number;
    default: number;
}
export interface TotalFieldOptions {
    dataTarget?: string;
}
export interface BasisFieldOptions {
    dataTarget?: string;
}
export interface MinOptions {
    default?: number;
}
export interface MaxOptions {
    default?: number;
}
export interface LegendOptions { // toggle button
    dataTarget?: string;
    default?: boolean;
}

export interface IconOptions {
    default?: boolean;
}

export interface SubTotalOptions {
    default?: boolean;
    toggle?: boolean;
}

export interface TotalOptions {
    default?: boolean;
    toggle?: boolean;
}

export interface ComparisonOptions {
    toggle?: boolean;
    granularity?: Granularity;
    forTable?: boolean;
    compareTargets?: any[]; // subTotal or X-Axis
}

export type FormatRulesType = typeof FORMAT_RULE_TYPE[keyof typeof FORMAT_RULE_TYPE];
export interface FormatRulesOptions {
    formatRulesType: FormatRulesType;
    dataTarget?: string;
}
type WidgetFieldOptions = DataFieldOptions | TableDataFieldOptions | XAxisOptions | YAxisOptions
    | LineByOptions | StackByOptions | GroupByOptions | CategoryByOptions
    | TotalFieldOptions | BasisFieldOptions
    | FormatRulesOptions | MinOptions | MaxOptions | LegendOptions | IconOptions | SubTotalOptions | TotalOptions
    | ComparisonOptions;

export interface WidgetFieldSchema<FieldOption=WidgetFieldOptions> {
    options?: Partial<FieldOption>;
}

export type WidgetFieldName = 'dataField' | 'tableDataField' | 'xAxis' | 'yAxis'
    | 'stackBy' | 'lineBy' | 'groupBy' | 'categoryBy'
    | 'totalField' | 'basisField'
    | 'min' | 'max'
    | 'icon' | 'comparison' | 'legend'
    | 'subTotal' | 'total'
    | 'progressBar'
    | 'formatRules'
    | 'granularity';

export interface WidgetFieldComponentProps<FieldOptions> {
    dataTable?: DataTableModel;
    widgetFieldSchema?: WidgetFieldSchema<FieldOptions>;
    isValid?: boolean;
    value?: any;
}

export interface WidgetFieldComponentEmit<ValueType> {
    (e: 'update:value', value: ValueType): void;
    (e: 'update:is-valid', value: boolean): void;
}
