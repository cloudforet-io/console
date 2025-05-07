import type { ApiClientsSchemaType } from '@/lib/config/global-config/types/type';


export const ApiClientEndpoint: ApiClientsSchemaType = {
    DASHBOARDS: {
        V1: 'dashboard',
    },
    PROJECT: {
        V1: 'identity',
    },
    SERVICE_ACCOUNT: {
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
