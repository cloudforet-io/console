import type { DATE_AGGREGATION_OPTIONS } from '@/common/modules/widgets/_widget-fields/date-aggregation-options/constant';

export interface DateAggregationOptionsValue {
    value: DateAggregationOtionsType;
}

export type DateAggregationOtionsType = typeof DATE_AGGREGATION_OPTIONS[keyof typeof DATE_AGGREGATION_OPTIONS];

export interface DateAggregationOptionsOptions {
    default?: DateAggregationOtionsType;
}
