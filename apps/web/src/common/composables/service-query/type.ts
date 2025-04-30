import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type {
    Granularity, GroupBy, Period,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


export type ServiceName = 'cost-analysis' | 'admin-cost-analysis';

/* Cost Analysis */
export interface CostAnalysisParams {
    dataSourceId: string;
    costQuerySetId: string;
    workspaceId?: string;
}
export interface CostAnalysisQuery {
    granularity?: Granularity;
    group_by?: GroupBy[];
    period?: Period;
    filters?: ConsoleFilter[];
}

/* Service Navigation Spec */
export interface ServiceNavigationSpec<TParams, TQuery> {
    route: {
        name: string;
        adminName?: string;
    };
    params: {
        required?: (keyof TParams)[];
        optional?: (keyof TParams)[];
    };
    query: {
        required?: (keyof TQuery)[];
        optional?: (keyof TQuery)[];
    };
}

/* Service Params Map */
export type ServiceParamsMap = {
    'cost-analysis': CostAnalysisParams;
    'admin-cost-analysis': CostAnalysisParams;
};

export type ServiceQueryMap = {
    'cost-analysis': CostAnalysisQuery;
    'admin-cost-analysis': CostAnalysisQuery;
};
