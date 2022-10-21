import type {
    CostQuerySetModel, Period, Granularity, GroupBy, MoreGroupByItem, CostFiltersMap,
} from '@/services/cost-explorer/type';

export interface GroupByItem {
    name: string;
    label: string;
}

export interface CostAnalysisStoreState {
    granularity: Granularity;
    stack: boolean;
    groupBy: GroupBy[];
    primaryGroupBy?: GroupBy | string;
    moreGroupBy: MoreGroupByItem[];
    period: Period;
    filters: CostFiltersMap;
    selectedQueryId?: string;
    costQueryList: CostQuerySetModel[];
}
