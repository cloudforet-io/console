import { FILTER, GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
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
    group_by: GROUP_BY[]; // string[]
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

export type CostQueryFilters = Partial<Record<FILTER, string[]>>
export type CostQueryFilterItemsMap = Partial<Record<FILTER, FilterItem[]>>

export interface CostAnalysisStoreState {
    chartType: CHART_TYPE;
    granularity: GRANULARITY;
    groupByItems: GroupByItem[];
    groupBy?: GROUP_BY;
    period: Period;
    filters: CostQueryFilters;
    selectedQueryId: string|undefined;
    costQueryList: CostQuerySetModel[];
}
