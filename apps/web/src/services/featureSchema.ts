export const FEATURES = {
    DASHBOARD: 'DASHBOARD',
    PROJECT: 'PROJECT',
    SERVICE_ACCOUNT: 'SERVICE_ACCOUNT',
    ASSET_INVENTORY: 'ASSET_INVENTORY',
    COST_EXPLORER: 'COST_EXPLORER',
    ALERT_MANAGER: 'ALERT_MANAGER',
    OPS_FLOW: 'OPS_FLOW',
    IAM: 'IAM',
    COMMON: 'COMMON',
} as const;

export type featuresType = typeof FEATURES[keyof typeof FEATURES];

export type schemaType = {
    id: featuresType;
    version?: string;
    menu?: Record<string, boolean>;
    affectsUI?: Record<string, boolean>;
};

export type FeatureSchema = Record<featuresType, schemaType>;

export const initialFeatureSchema: FeatureSchema = {
    DASHBOARD: {
        id: 'DASHBOARD',
        version: 'V1',
        menu: { DASHBOARD: true },
    },
    PROJECT: {
        id: 'PROJECT',
        version: 'V1',
        menu: { PROJECT: true },
        affectsUI: {
            AlertTab: true,
        },
    },
    SERVICE_ACCOUNT: {
        id: 'SERVICE_ACCOUNT',
        version: 'V1',
        menu: { SERVICE_ACCOUNT: true },
    },
    ASSET_INVENTORY: {
        id: 'ASSET_INVENTORY',
        version: 'V1',
        menu: {
            CLOUD_SERVICE: true,
            SERVER: true,
            SECURITY: true,
            METRIC_EXPLORER: true,
            COLLECTOR: true,
        },
    },
    COST_EXPLORER: {
        id: 'COST_EXPLORER',
        version: 'V1',
        menu: {
            COST_ANALYSIS: true,
            BUDGET: true,
            COST_REPORT: true,
            DATA_SOURCES: false,
            COST_ADVANCED_SETTINGS: false,
        },
    },
    ALERT_MANAGER: {
        id: 'ALERT_MANAGER',
        version: 'V1',
        menu: {
            ALERT_MANAGER_DASHBOARD: true,
            SERVICE: false,
            ALERTS: true,
            ESCALATION_POLICY: true,
        },
    },
    OPS_FLOW: {
        id: 'OPS_FLOW',
        version: 'V1',
        menu: {
            TASK_MANAGEMENT: false,
            OPS_FLOW_LANDING: true,
            TASK_BOARD: true,
        },
    },
    IAM: {
        id: 'IAM',
        version: 'V1',
        menu: {
            USER: true,
            USER_GROUP: false,
            APP: true,
            ROLE: false,
        },
    },
    COMMON: {
        id: 'COMMON',
        affectsUI: {
            topBarAlertIcon: true,
        },
    },
};
