import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type {
    Granularity, GroupBy, Period, RelativePeriod,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


export interface CostQuerySetOption {
    group_by?: Array<string|GroupBy>;
    granularity: Granularity;
    period?: Period;
    relative_period?: RelativePeriod;
    filters?: ConsoleFilter[];
    metadata?: {
        filters_schema?: {
            enabled_properties?: string[];
        }
    }
}
