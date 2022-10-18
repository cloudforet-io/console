import type { RouteQueryString } from '@/lib/router-query-string';

import type { CostAnalysisPageUrlQueryKey } from '@/services/cost-explorer/cost-analysis/lib/config';
import type {
    CostQueryFilters, Period, Granularity, GroupBy,
} from '@/services/cost-explorer/type';


export type CostAnalysisPageUrlQuery = Partial<Record<CostAnalysisPageUrlQueryKey, RouteQueryString>>;

export interface CostAnalysisPageQueryValue {
    period?: Period;
    groupBy?: GroupBy[];
    primaryGroupBy?: GroupBy;
    filters?: CostQueryFilters;
    stack?: boolean;
    granularity?: Granularity;
}

export const CHART_TYPE = Object.freeze({
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
});

export interface QueryItemResource {
    key: string;
    name: string;
}
