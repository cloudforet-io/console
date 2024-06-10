export interface ComparisonValue {
    fieldName?: string;
    compareWith?: string;
    compareTarget?: string;
    decreaseColor?: string;
    increaseColor?: string;
    format?: 'all'|'percent'|'fixed';
}
export interface FormatRulesValue {
    threshold: number;
    color: string;
    name?: string;
    dropdownItem?: string; // TODO: weired name...
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
    value: string | string[];
    count: number;
}
export interface GroupByValue {
    value: string | string[];
    count?: number;
}

export type WidgetFieldValues = string | string[] | number | ComparisonValue[] | FormatRulesValue
    | LineByValue | StackByValue | CategoryByValue | GroupByValue
    | XAxisValue | YAxisValue | TableDataFieldValue;
