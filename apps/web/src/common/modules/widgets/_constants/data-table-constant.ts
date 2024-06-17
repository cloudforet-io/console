
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
    WHERE: 'WHERE',
    AGGREGATE: 'AGGREGATE',
    EVAL: 'EVAL',
} as const;

export const JOIN_TYPE = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    OUTER: 'OUTER',
    INNER: 'INNER',
} as const;

// NOTE: temporary solution for the global variable
export const MANAGED_GLOBAL_VARIABLE = [GROUP_BY.WORKSPACE, GROUP_BY.PROJECT, GROUP_BY.SERVICE_ACCOUNT, GROUP_BY.REGION] as string[];
