type apiClientType = {
    V1: string;
    V2?: string;
};
export interface ApiClients {
    DASHBOARDS: apiClientType,
    PROJECT: apiClientType,
    ASSET_INVENTORY: apiClientType,
    COST_ANALYSIS: apiClientType,
    OPS_FLOW: apiClientType,
    ALERT_MANAGER: apiClientType,
}

export const ApiClientSchema: ApiClients = {
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
