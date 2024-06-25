import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import type { FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { FormatRulesValue, WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';

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
    defaultMaxCount: number;
}
export interface YAxisOptions {
    dataTarget?: string;
    max?: number;
    defaultMaxCount: number;
}
export interface LineByOptions {
    dataTarget?: string;
    max?: number;
    defaultMaxCount: number;
}
export interface StackByOptions {
    dataTarget?: string;
    max?: number;
    defaultMaxCount: number;
}
export interface GroupByOptions {
    dataTarget?: string;
    multiSelectable?: boolean;
    hideCount?: boolean;
    max?: number;
    defaultMaxCount: number;
}
export interface CategoryByOptions {
    dataTarget?: string;
    max?: number;
    defaultMaxCount: number;
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
    default?: boolean;
}

export interface IconOptions {
    default?: string; // e.g. 'ic_coin-filled'
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
    // forTable?: boolean;
}

export interface ProgressBarOptions {
    defaultFormatRules?: FormatRulesValue[];
    baseColor?: string;
}

export type FormatRulesType = typeof FORMAT_RULE_TYPE[keyof typeof FORMAT_RULE_TYPE];
export interface FormatRulesOptions {
    formatRulesType: FormatRulesType;
    dataTarget?: string;
    description?: string;
    default?: FormatRulesValue[];
    baseColor?: string;
}

export interface ColorSchemaOptions {
    default?: string;
}
export type WidgetFieldOptions = DataFieldOptions | TableDataFieldOptions | XAxisOptions | YAxisOptions
    | LineByOptions | StackByOptions | GroupByOptions | CategoryByOptions
    | TotalFieldOptions | BasisFieldOptions
    | FormatRulesOptions | MinOptions | MaxOptions | LegendOptions | IconOptions | SubTotalOptions | TotalOptions
    | ComparisonOptions | ProgressBarOptions | ColorSchemaOptions;

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
    | 'granularity' | 'colorSchema';

export interface WidgetFieldComponentProps<FieldOptions> {
    dataTable?: PublicDataTableModel|PrivateDataTableModel;
    allValueMap: {
        [key in WidgetFieldName]: WidgetFieldValues;
    }
    widgetFieldSchema?: WidgetFieldSchema<FieldOptions>;
    isValid?: boolean;
    value?: any;
}

export interface WidgetFieldComponentEmit<ValueType> {
    (e: 'update:value', value: ValueType): void;
    (e: 'update:is-valid', value: boolean): void;
}
