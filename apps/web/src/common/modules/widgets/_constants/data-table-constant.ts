
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

export const DEFAULT_DATE_SORT = [{ key: 'Date', desc: false }];
export const DEFAULT_SEPARATED_DATE_SORT = [
    // { key: 'Year', desc: false }, { key: 'Month', desc: false }, { key: 'Day', desc: false },
];
