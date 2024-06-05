export interface ComparisonValue {
    fieldName?: string;
    compareWith?: string;
    compareTarget?: string;
    decreaseColor?: string;
    increaseColor?: string;
    format?: 'all'|'percent'|'fixed';
}

export type WidgetFieldValues = string | ComparisonValue; // TODO: Add more types as needed
