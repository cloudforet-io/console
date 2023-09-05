import type { ConsoleFilterOperator } from '@cloudforet/core-lib/query/type';

import type { CostAnalysisPeriodType } from '@/services/cost-explorer/cost-analysis/type';
import type { FILTER, GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';


export interface Period {
    start?: string;
    end?: string;
}

export interface FilterItem {
    k: string | Filter;
    v: string;
    o: ConsoleFilterOperator;
}

export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type GroupBy = typeof GROUP_BY[keyof typeof GROUP_BY];
export type Filter = typeof FILTER[keyof typeof FILTER];

export type CostFiltersMap = Record<Filter, FilterItem[]>;

export interface CostQuerySetOption {
    group_by?: Array<string|GroupBy>;
    granularity: Granularity;
    period?: Period;
    period_type?: CostAnalysisPeriodType;
    filters?: CostFiltersMap;
}

export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    options?: CostQuerySetOption;
}

export interface GroupByItem {
    name: string;
    label: string;
}
