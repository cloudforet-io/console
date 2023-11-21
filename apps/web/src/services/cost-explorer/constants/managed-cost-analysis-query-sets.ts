import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constants';
import type { CostQuerySetModel } from '@/services/cost-explorer/types/cost-explorer-query-type';

export const DYNAMIC_COST_QUERY_SET_PARAMS = 'dynamic';

export const MANAGED_COST_QUERY_SET_IDS = {
    MONTHLY_PROJECT: 'Monthly cost by project',
    MONTHLY_PRODUCT: 'Monthly cost by product',
    DAILY_PRODUCT: 'Daily cost by product',
} as const;

export const MANAGED_COST_QUERY_SET_ID_LIST: string[] = [
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
    MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT,
];

export const ManagedCostQuerySets: Omit<CostQuerySetModel, 'data_source_id'>[] = [
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
        options: {
            group_by: [GROUP_BY.PROJECT],
            granularity: GRANULARITY.MONTHLY,
            relative_period: {
                unit: 'month',
                value: 5,
                include_today: true,
            },
            metadata: {
                filters_schema: {
                    enabled_properties: Object.values(GROUP_BY),
                },
            },
        },
    },
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
        options: {
            group_by: [GROUP_BY.PRODUCT],
            granularity: GRANULARITY.MONTHLY,
            relative_period: {
                unit: 'month',
                value: 5,
                include_today: true,
            },
            metadata: {
                filters_schema: {
                    enabled_properties: Object.values(GROUP_BY),
                },
            },
        },
    },
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT,
        name: MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT,
        options: {
            group_by: [GROUP_BY.PRODUCT],
            granularity: GRANULARITY.DAILY,
            relative_period: {
                unit: 'month',
                value: 0,
                include_today: true,
            },
            metadata: {
                filters_schema: {
                    enabled_properties: Object.values(GROUP_BY),
                },
            },
        },
    },
];
