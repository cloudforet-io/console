import type {
    CostAnalysisQuery,
    ServiceName,
    ServiceNavigationSpec,
    ServiceParamsMap,
    ServiceQueryMap,
} from '@/common/composables/service-query/type';

import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


export const serviceNavigationSpecMap: {
    [K in ServiceName]: ServiceNavigationSpec<ServiceParamsMap[K], ServiceQueryMap[K]>;
} = {
    'cost-analysis': {
        route: {
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        },
        params: {
            required: ['dataSourceId', 'costQuerySetId'],
            optional: ['workspaceId'],
        },
        query: {
            optional: ['granularity', 'group_by', 'period', 'filters'] as (keyof CostAnalysisQuery)[],
        },
    },
    'admin-cost-analysis': {
        route: {
            name: ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        },
        params: {
            required: ['dataSourceId', 'costQuerySetId'],
        },
        query: {
            optional: ['granularity', 'group_by', 'period', 'filters'] as (keyof CostAnalysisQuery)[],
        },
    },
} as const;

