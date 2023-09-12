import type { TranslateResult } from 'vue-i18n';

import type { ManipulateType } from 'dayjs';

import type { RouteQueryString } from '@/lib/router-query-string';

import type { CostAnalysisPageUrlQueryKey } from '@/services/cost-explorer/cost-analysis/lib/config';
import type { Granularity, Period } from '@/services/cost-explorer/type';


export type CostAnalysisPageUrlQuery = Partial<Record<CostAnalysisPageUrlQueryKey, RouteQueryString>>;

export interface CostAnalysisPageQueryValue {
    period?: Period;
    group_by?: string[];
    filters?: Record<string, string[]>;
    granularity?: Granularity;
}

export interface QueryItemResource {
    key: string;
    name: string;
}


/* widget spec */
export interface ChartData {
    [key: string]: any;
}
export interface XYChartData {
    date: string;
    totalCost?: number;
    aggregation?: number;
    [key: string]: any;
}
export interface Legend {
    name: string;
    label: string | TranslateResult;
    color?: string;
    disabled?: boolean;
}


export type RelativePeriod = {
    unit: ManipulateType;
    value: number;
    include_today: boolean;
};
