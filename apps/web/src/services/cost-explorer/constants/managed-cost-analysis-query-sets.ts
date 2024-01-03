import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';

import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


export const DYNAMIC_COST_QUERY_SET_PARAMS = 'dynamic';

export const MANAGED_COST_QUERY_SET_IDS = {
    // MONTHLY_WORKSPACE: 'Monthly cost by workspace',
    MONTHLY_PROJECT: 'Monthly cost by project',
    MONTHLY_PRODUCT: 'Monthly cost by product',
    DAILY_PRODUCT: 'Daily cost by product',
} as const;

export const MANAGED_COST_QUERY_SET_ID_LIST: string[] = [
    // MANAGED_COST_QUERY_SET_IDS.MONTHLY_WORKSPACE,
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
    MANAGED_COST_QUERY_SET_IDS.DAILY_PRODUCT,
];

const DEFAULT_MANAGED_COST_QUERY_SET_LIST: Partial<CostQuerySetModel>[] = [
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

export const MANAGED_COST_QUERY_SET_LIST: Partial<CostQuerySetModel>[] = [
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
    ...DEFAULT_MANAGED_COST_QUERY_SET_LIST,
];
export const ADMIN_MANAGED_COST_QUERY_SET_LIST: Partial<CostQuerySetModel>[] = [
    // {
    //     cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_WORKSPACE,
    //     name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_WORKSPACE,
    //     options: {
    //         group_by: [GROUP_BY.WORKSPACE],
    //         granularity: GRANULARITY.MONTHLY,
    //         relative_period: {
    //             unit: 'month',
    //             value: 5,
    //             include_today: true,
    //         },
    //         metadata: {
    //             filters_schema: {
    //                 enabled_properties: Object.values(GROUP_BY),
    //             },
    //         },
    //     },
    // },
    ...DEFAULT_MANAGED_COST_QUERY_SET_LIST,
];
