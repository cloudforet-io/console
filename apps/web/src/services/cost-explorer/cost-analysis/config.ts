import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

export const DYNAMIC_COST_QUERY_SET_PARAMS = 'dynamic';

export const ORIGIN_MANAGED_COST_QUERY_SET_IDS = {
    MONTHLY_PROJECT: 'Monthly cost by project',
    MONTHLY_PRODUCT: 'Monthly cost by product',
    DAILY_PRODUCT: 'Daily cost by product',
} as const;

export const originManagedCostQuerySets: CostQuerySetModel[] = [
    {
        cost_query_set_id: ORIGIN_MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
        name: ORIGIN_MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
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
        cost_query_set_id: ORIGIN_MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
        name: ORIGIN_MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
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
        cost_query_set_id: ORIGIN_MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT,
        name: ORIGIN_MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT,
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
