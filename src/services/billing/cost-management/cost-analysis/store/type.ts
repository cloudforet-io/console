import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { CostQueryFilters, CostQuerySetModel, Period } from '@/services/billing/cost-management/type';

export interface GroupByItem {
    name: string;
    label: string;
}

export interface CostAnalysisStoreState {
    granularity: GRANULARITY;
    stack: boolean;
    groupBy: GROUP_BY[];
    primaryGroupBy?: GROUP_BY;
    period: Period;
    filters: CostQueryFilters;
    selectedQueryId?: string;
    costQueryList: CostQuerySetModel[];
}
