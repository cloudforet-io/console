import type { ApiClientsSchemaType } from '@/lib/config/global-config/type';

export const ApiClientSchema: ApiClientsSchemaType = {
    DASHBOARDS: {
        V1: 'dashboard',
    },
    PROJECT: {
        V1: 'identity',
    },
    ASSET_INVENTORY: {
        V1: 'inventory',
    },
    COST_ANALYSIS: {
        V1: 'costAnalysis',
    },
    OPS_FLOW: {
        V1: 'opsflow',
    },
    ALERT_MANAGER: {
        V1: 'monitoring',
        V2: 'alertManager',
    },
};
