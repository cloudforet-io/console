import type {
    CostQueryFilters, CostQuerySetModel, Period, Granularity, GroupBy,
} from '@/services/cost-explorer/type';

export interface GroupByItem {
    name: string;
    label: string;
}

export interface CostAnalysisStoreState {
    granularity: Granularity;
    stack: boolean;
    groupBy: GroupBy[];
    primaryGroupBy?: GroupBy;
    period: Period;
    filters: CostQueryFilters;
    selectedQueryId?: string;
    costQueryList: CostQuerySetModel[];
}
