export type ComparisonFormat = 'all'|'percent'|'fixed';

export interface ComparisonValue {
    decreaseColor?: string;
    increaseColor?: string;
    format?: ComparisonFormat;
    toggleValue: boolean;
}

export interface ComparisonOptions {
    toggle?: boolean;
}
