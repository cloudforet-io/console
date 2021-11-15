import {
    CHART_TYPE, CURRENCY, GRANULARITY, FilterItem, FILTER_ITEM,
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
    selectedDates: string[];
    currency: CURRENCY;
    filters: Record<FILTER_ITEM, FilterItem[]>;
}
