import type { ComparisonFormat } from '@/common/modules/widgets/_widget-fields/comparison/type';

export interface TableColumnComparisonValue {
    toggleValue: boolean;
    decreaseColor?: string;
    increaseColor?: string;
    format?: ComparisonFormat;
    fields?: string[];
}

export interface TableColumnComparisonOptions {
    toggle?: boolean;
}
