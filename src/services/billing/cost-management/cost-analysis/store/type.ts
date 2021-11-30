import { FILTER_ITEM, GRANULARITY, GROUP_BY_ITEM } from '@/services/billing/cost-management/lib/config';
import { QUERY_VISIBILITY_TYPE } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';


export interface Period {
    start?: string;
    end?: string;
}

export interface GroupByItem {
    name: string;
    label: string;
}

export interface FilterItem {
    name: string;
    label: string;
}

export interface CostQuerySetOption {
    chart_type: CHART_TYPE;
    group_by: GROUP_BY_ITEM[];
    granularity: GRANULARITY;
    period: Period;
    filters: CostQueryFilters;
}

export interface CostQuerySetModel {
    cost_query_set_id: string;
    name: string;
    scope: QUERY_VISIBILITY_TYPE;
    options?: CostQuerySetOption;
}

export type CostQueryFilters = Partial<Record<FILTER_ITEM, string[]>>
export type CostQueryFilterItemsMap = Partial<Record<FILTER_ITEM, FilterItem[]>>

export interface CostAnalysisStoreState {
    chartType: CHART_TYPE;
    granularity: GRANULARITY;
    groupByItems: GroupByItem[];
    groupBy?: string;
    period: Period;
    filters: CostQueryFilters;
    selectedQueryId: string|undefined;
    costQueryList: CostQuerySetModel[];
}
