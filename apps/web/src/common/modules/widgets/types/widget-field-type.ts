import type { Granularity } from '@/schema/dashboard/_types/widget-type';


export interface DataFieldOptions {
    multiSelectable?: boolean;
}
export interface XAxisOptions {
    dataTarget?: string;
}
export interface YAxisOptions {
    dataTarget?: string;
}
export interface LineByOptions {
    dataTarget?: string;
}
export interface StackByOptions {
    dataTarget?: string;
}
export interface GroupByOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
}
export interface CategoryByOptions {
    dataTarget?: string;
}
export interface TotalFieldOptions {
    dataTarget?: string;
}
export interface BasisFieldOptions {
    dataTarget?: string;
}
export interface MinOptions {
    dataTarget?: string;
    default?: number;
}
export interface MaxOptions {
    dataTarget?: string;
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

export type FormatRulesField = 'name' | 'threshold' | 'color'| 'dropdown';
export interface FormatRulesOptions {
    fields: FormatRulesField[];
    dataTarget?: string;
}
type WidgetFieldOptions = DataFieldOptions | XAxisOptions | YAxisOptions
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
    | 'formatRules';

export interface WidgetFieldComponentProps<FieldOptions> {
    widgetFieldSchema: WidgetFieldSchema<FieldOptions>;
    isValid?: boolean;
    value?: any;
}

export interface WidgetFieldComponentEmit<ValueType> {
    (e: 'update:value', value: ValueType): void;
    (e: 'update:is-valid', value: boolean): void;
}
