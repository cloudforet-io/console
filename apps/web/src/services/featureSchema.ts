import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const FEATURES = {
    DASHBOARDS: 'DASHBOARDS',
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

type affectsUIType = {
    showAlert?: boolean;
};
export type versionSchemaType = {
    menu: Record<MenuId, boolean>;
    adminMenu: Record<MenuId, boolean>;
    affectsUI?: affectsUIType;
};
export type schemaType = {
    currentVersion: string;
    V1: versionSchemaType;
    V2?: versionSchemaType;
    affectsUI?: affectsUIType;
};

export type FeatureSchema = Record<featuresType, schemaType>;

export const initialFeatureSchema: FeatureSchema = {
    [FEATURES.DASHBOARDS]: {
        currentVersion: 'V1',
        V1: {
            menu: { [MENU_ID.DASHBOARDS]: true },
        },
    },
    [FEATURES.PROJECT]: {
        currentVersion: 'V1',
        V1: {
            menu: { [MENU_ID.PROJECT]: true },
            affectsUI: {
                showAlert: true,
            },
        },
    },
    [FEATURES.SERVICE_ACCOUNT]: {
        currentVersion: 'V1',
        V1: {
            menu: { [MENU_ID.SERVICE_ACCOUNT]: true },
        },
    },
    [FEATURES.ASSET_INVENTORY]: {
        currentVersion: 'V1',
        V1: {
            menu: {
                [MENU_ID.CLOUD_SERVICE]: true,
                [MENU_ID.SERVER]: true,
                [MENU_ID.SECURITY]: true,
                [MENU_ID.METRIC_EXPLORER]: true,
                [MENU_ID.COLLECTOR]: true,
            },
            affectsUI: {
                showAlert: true,
            },
        },
    },
    [FEATURES.COST_EXPLORER]: {
        currentVersion: 'V1',
        V1: {
            menu: {
                [MENU_ID.COST_ANALYSIS]: true,
                [MENU_ID.BUDGET]: true,
                [MENU_ID.COST_REPORT]: true,
            },
            adminMenu: {
                [MENU_ID.COST_ANALYSIS]: true,
                [MENU_ID.BUDGET]: true,
                [MENU_ID.COST_REPORT]: true,
                [MENU_ID.DATA_SOURCES]: true,
                [MENU_ID.COST_ADVANCED_SETTINGS]: true,
            },
        },
    },
    [FEATURES.ALERT_MANAGER]: {
        currentVersion: 'V1',
        V1: {
            menu: {
                [MENU_ID.ALERT_MANAGER_DASHBOARD]: true,
                [MENU_ID.ALERTS]: true,
                [MENU_ID.ESCALATION_POLICY]: true,
            },
        },
        V2: {
            menu: {
                [MENU_ID.SERVICE]: true,
                [MENU_ID.ALERTS]: true,
            },
        },
    },
    [FEATURES.OPS_FLOW]: {
        currentVersion: 'V1',
        V1: {
            menu: {
                [MENU_ID.OPS_FLOW_LANDING]: true,
                [MENU_ID.TASK_BOARD]: true,
            },
            adminMenu: {
                [MENU_ID.TASK_MANAGEMENT]: true,
            },
        },
    },
    [FEATURES.IAM]: {
        currentVersion: 'V1',
        V1: {
            menu: {
                [MENU_ID.USER]: true,
                [MENU_ID.USER_GROUP]: false,
                [MENU_ID.APP]: true,
            },
            adminMenu: {
                [MENU_ID.USER]: true,
                [MENU_ID.USER_GROUP]: false,
                [MENU_ID.APP]: true,
                [MENU_ID.ROLE]: true,
            },
        },
    },
};
