import type {
    CostQuerySetModel, Period, Granularity, GroupBy, MoreGroupByItem,
    CostQueryFilterItem,
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
    moreGroupBy: MoreGroupByItem[];
    period: Period;
    filters: CostQueryFilterItem[];
    selectedQueryId?: string;
    costQueryList: CostQuerySetModel[];
}
