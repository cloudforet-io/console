import type { ManipulateType } from 'dayjs';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { FILTER, GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


export interface Period {
    start?: string;
    end?: string;
}
export type RelativePeriod = {
    unit: ManipulateType;
    value: number;
    include_today: boolean;
};

export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type GroupBy = typeof GROUP_BY[keyof typeof GROUP_BY];
export type Filter = typeof FILTER[keyof typeof FILTER];

export type DisplayDataType = 'cost' | 'usage';

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

export interface CostQuerySetOptionForPeriod {
    granularity: Granularity;
    period?: Period;
    relativePeriod: RelativePeriod;
}

export interface CostQuerySetModel {
    cost_query_set_id: string;
    data_source_id: string; // This isn't using in cost-analysis now. Just used in GNB favorite.
    name: string;
    options?: CostQuerySetOption;
}

export interface CostAnalyzeResponse<CostAnalyzeRawData> {
    more?: boolean;
    results: CostAnalyzeRawData[];
}
