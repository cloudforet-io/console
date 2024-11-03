
import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


export const DATA_TABLE_TYPE = {
    ADDED: 'ADDED',
    TRANSFORMED: 'TRANSFORMED',
};

export const DATA_SOURCE_DOMAIN = {
    COST: 'COST',
    ASSET: 'ASSET',
    SECURITY: 'SECURITY',
};

export const DATA_TABLE_OPERATOR = {
    CONCAT: 'CONCAT',
    JOIN: 'JOIN',
    QUERY: 'QUERY',
    // AGGREGATE: 'AGGREGATE',
    EVAL: 'EVAL',
} as const;

export const JOIN_TYPE = {
    LEFT: 'left',
    RIGHT: 'right',
    OUTER: 'outer',
    INNER: 'inner',
} as const;

// NOTE: temporary solution for the global variable
export const MANAGED_GLOBAL_VARIABLE = [GROUP_BY.WORKSPACE, GROUP_BY.PROJECT, GROUP_BY.SERVICE_ACCOUNT, GROUP_BY.REGION] as string[];

export const EVAL_EXPRESSION_TYPE = {
    LABEL: 'LABEL',
    DATA: 'DATA',
} as const;

export const DATA_TABLE_QUERY_OPERATOR = {
    contain_in: {
        key: 'contain_in',
        operator: 'contain_in',
        label: 'contains',
    },
    not_contain_in: {
        key: 'not_contain_in',
        operator: 'not_contain_in',
        label: 'does not contain',
    },
    in: {
        key: 'in',
        operator: 'in',
        label: 'equals',
    },
    not_in: {
        key: 'not_in',
        operator: 'not_in',
        label: 'does not equal',
    },
    use_global_variable: {
        key: 'use_global_variable',
        operator: 'contain_in', // temporary solution
        label: 'use global variable',
    },
} as const;

export const KEYWORD_FILTER_DISABLED_KEYS = [GROUP_BY.PROJECT, GROUP_BY.WORKSPACE, GROUP_BY.SERVICE_ACCOUNT];
