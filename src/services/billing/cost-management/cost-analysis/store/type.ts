import {
    CHART_TYPE, GRANULARITY, FilterItem, FILTER_ITEM, CostQuerySetModel, Period,
} from '@/services/billing/cost-management/cost-analysis/lib/config';


export interface GroupByItem {
    name: string;
    label: string;
}

export interface CostAnalysisStoreState {
    chartType: CHART_TYPE;
    granularity: GRANULARITY;
    groupByItems: GroupByItem[];
    groupBy?: string;
    period: Period;
    filters: Record<FILTER_ITEM, FilterItem[]>;
    selectedQueryId: string|undefined;
    costQueryList: CostQuerySetModel[];
}
