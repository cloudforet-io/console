import { CHART_TYPE, CURRENCY, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { Legend } from '@/common/composables/dynamic-chart/type';

export interface ChartData {
    [key: string]: any;
}

export type ChartType = typeof CHART_TYPE[keyof typeof CHART_TYPE];
export type Granularity = typeof GRANULARITY[keyof typeof GRANULARITY];
export type Currency = typeof CURRENCY[keyof typeof CURRENCY];

export interface GroupByItem {
    name: string;
    label: string;
}

export interface CostAnalysisStoreState {
    chartType: ChartType;
    granularity: string;
    groupByItems: Array<GroupByItem>;
    groupByItem?: GroupByItem;
    selectedDates: Array<string>;
    currency: Currency;
    chartData: Array<ChartData>;
    legends: Array<Legend>;
}
