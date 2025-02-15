import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type {
    Granularity, GroupBy, Period, RelativePeriod, DisplayDataType,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


export interface CostQuerySetOption {
    group_by?: Array<string|GroupBy>;
    granularity: Granularity;
    period?: Period;
    relative_period?: RelativePeriod;
    filters?: ConsoleFilter[];
    display_data_type?: DisplayDataType;
    is_all_workspace_selected?: boolean;
    workspace_scope?: string;
    metadata?: {
        filters_schema?: {
            enabled_properties?: string[];
        }
    }
}
