import type { COLOR_SCHEMA, DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';

export interface Icon {
    name: string;
    label: string;
}
// Field Value Options
export interface IconValue {
    icon: Icon;
    color: string;
}

export type ComparisonFormat = 'all'|'percent'|'fixed';
export interface ComparisonValue {
    decreaseColor?: string;
    increaseColor?: string;
    format?: ComparisonFormat;
}

export interface ProgressBarValue {
    fieldName: string;
    basisField?: string;
    totalField?: string;
    formatRules?: FormatRulesValue[];
    baseColor?: string;
}
export interface FormatRulesValue {
    threshold?: number;
    color: string;
}
export interface LineByValue {
    value: string;
    count: number;
}
export interface StackByValue {
    value: string;
    count: number;
}
export interface CategoryByValue {
    value: string;
    count: number;
}
export interface XAxisValue {
    value: string;
    count: number;
}
export interface YAxisValue {
    value: string;
    count: number;
}
export interface TableDataFieldValue {
    fieldType: 'dynamicField' | 'staticField';
    value?: string | string[];
    criteria?: string;
    count: number;
}
export interface GroupByValue {
    value?: string | string[];
    count?: number;
}

export interface TotalValue {
    toggleValue: boolean;
    freeze: boolean;
}

export interface WidgetHeaderValue {
    toggleValue: boolean;
    title?: string;
    description?: string;
}

export interface AbbreviationValue {
    toggleValue: boolean;
}

export type ColorValue = typeof COLOR_SCHEMA[keyof typeof COLOR_SCHEMA];
export interface ColorSchemaValue {
    colorName: keyof typeof COLOR_SCHEMA;
    colorValue: ColorValue;
}

export type DateFormat = keyof typeof DATE_FORMAT;
export interface DateFormatValue {
    value: DateFormat;
}

export type WidgetFieldValues = string | string[] | number | boolean | ComparisonValue[] | ProgressBarValue | FormatRulesValue[]
    | LineByValue | StackByValue | CategoryByValue | GroupByValue
    | XAxisValue | YAxisValue | TableDataFieldValue | IconValue | TotalValue | ColorSchemaValue
    | WidgetHeaderValue | DateFormatValue;
