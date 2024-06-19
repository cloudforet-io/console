export interface Icon {
    name: string;
    label: string;
}
// Field Value Options
export interface IconValue {
    icon: Icon; color: string
}

export type ComparisonFormat = 'all'|'percent'|'fixed';
export interface ComparisonValue {
    // fieldName?: string;
    // compareTarget?: string;
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
    value: string | string[];
    count: number;
}
export interface GroupByValue {
    value: string | string[];
    count?: number;
}

export interface TotalValue {
    toggleValue: boolean;
    value: boolean;
}

export type WidgetFieldValues = string | string[] | number | boolean | ComparisonValue[] | FormatRulesValue[]
    | LineByValue | StackByValue | CategoryByValue | GroupByValue
    | XAxisValue | YAxisValue | TableDataFieldValue | IconValue | TotalValue;
