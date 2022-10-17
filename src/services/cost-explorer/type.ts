import type { FILTER, GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';


export interface Period {
    start?: string;
    end?: string;
}

export interface CostQueryFilterItem {
    category: string;
    key?: string;
    value: string;
}

export interface RefinedFilterItem extends CostQueryFilterItem {
    label: string;
}

export interface MoreGroupByItem {
    category: string;
    key: string;
    disabled?: boolean;
    selected?: boolean;
}

export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type GroupBy = typeof GROUP_BY[keyof typeof GROUP_BY];
export type Filter = typeof FILTER[keyof typeof FILTER];

export type CostQueryFilters = Partial<Record<Filter, string[]>>;

export interface CostQuerySetOption {
    group_by?: GroupBy[];
    primary_group_by?: GroupBy;
    more_group_by: MoreGroupByItem[];
    granularity: Granularity;
    stack?: boolean;
    period: Period;
    filters?: CostQueryFilterItem[];
}

export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    options?: CostQuerySetOption;
}
