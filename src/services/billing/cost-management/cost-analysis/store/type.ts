import {
    CHART_TYPE, CURRENCY, GRANULARITY, FILTER_ITEM,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';


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
    filters: Array<any>; // todo
}
