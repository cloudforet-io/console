import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';

export const MANAGED_COST_QUERY_SET_IDS = {
    MONTHLY_PROJECT: 'Monthly cost by project',
    MONTHLY_SERVICE_ACCOUNT: 'Monthly cost by service account',
    MONTHLY_PRODUCT: 'Monthly cost by product',
} as const;

export const managedCostQuerySetIdList: string[] = [
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_SERVICE_ACCOUNT,
    MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
];

export const COST_ANALYSIS_PERIOD_TYPE = {
    // monthly
    THIS_MONTH: 'thisMonth',
    LAST_MONTH: 'lastMonth',
    LAST_3_MONTHS: 'last3months',
    LAST_6_MONTHS: 'last6months',
    LAST_12_MONTHS: 'last12months',
    // yearly
    THIS_YEAR: 'thisYear',
    LAST_YEAR: 'lastYear',
    LAST_3_YEARS: 'last3years',
    LAST_5_YEARS: 'last5years',
    // custom
    CUSTOM: 'custom',
} as const;

export const managedCostQuerySets: CostQuerySetModel[] = [
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
        options: {
            group_by: [GROUP_BY.PROJECT],
            granularity: GRANULARITY.MONTHLY,
            period_type: COST_ANALYSIS_PERIOD_TYPE.LAST_6_MONTHS,
        },
    },
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_SERVICE_ACCOUNT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_SERVICE_ACCOUNT,
        options: {
            group_by: [GROUP_BY.SERVICE_ACCOUNT],
            granularity: GRANULARITY.MONTHLY,
            period_type: COST_ANALYSIS_PERIOD_TYPE.LAST_6_MONTHS,
        },
    },
    {
        cost_query_set_id: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
        name: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
        options: {
            group_by: [GROUP_BY.PRODUCT],
            granularity: GRANULARITY.MONTHLY,
            period_type: COST_ANALYSIS_PERIOD_TYPE.LAST_6_MONTHS,
        },
    },
];
