
import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


export const DATA_TABLE_TYPE = {
    ADD: 'ADD',
    TRANSFORM: 'TRANSFORM',
};

export const DATA_SOURCE_DOMAIN = {
    COST: 'COST',
    ASSET: 'ASSET',
    SECURITY: 'SECURITY',
};

// NOTE: temporary solution for the global variable
export const MANAGED_GLOBAL_VARIALBE = [GROUP_BY.WORKSPACE, GROUP_BY.PROJECT, GROUP_BY.SERVICE_ACCOUNT, GROUP_BY.REGION] as string[];
