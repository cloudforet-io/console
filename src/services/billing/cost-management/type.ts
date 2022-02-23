import { FILTER, GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';


export interface Period {
    start?: string;
    end?: string;
}

interface FilterItem {
    name: string;
    label: string;
}

export type CostQueryFilters = Partial<Record<FILTER, string[]>>
export type CostQueryFilterItemsMap = Partial<Record<FILTER, FilterItem[]>>

export interface CostQuerySetOption {
    group_by?: GROUP_BY[];
    primary_group_by?: GROUP_BY;
    granularity: GRANULARITY;
    stack?: boolean;
    period: Period;
    filters?: CostQueryFilters;
}

export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    options?: CostQuerySetOption;
}
