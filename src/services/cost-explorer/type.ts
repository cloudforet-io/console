import type { FILTER, GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';


export interface Period {
    start?: string;
    end?: string;
}

interface FilterItem {
    name: string;
    label: string;
}

export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type GroupBy = typeof GROUP_BY[keyof typeof GROUP_BY];
export type Filter = typeof FILTER[keyof typeof FILTER];

export type CostQueryFilters = Partial<Record<Filter, string[]>>
export type CostQueryFilterItemsMap = Partial<Record<Filter, FilterItem[]>>

export interface CostQuerySetOption {
    group_by?: GroupBy[];
    primary_group_by?: GroupBy;
    granularity: Granularity;
    stack?: boolean;
    period: Period;
    filters?: CostQueryFilters;
}

export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    options?: CostQuerySetOption;
}
