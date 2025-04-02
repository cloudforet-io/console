import { FEATURES } from '@/lib/config/global-config/constants';
import type { FeatureSchemaType } from '@/lib/config/global-config/type';
import { MENU_ID } from '@/lib/menu/config';

export const initialFeatureSchema: FeatureSchemaType = {
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
            uiAffects: {
                visibleAlertTabAtDetail: true,
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
            uiAffects: {
                visibleAlertTabAtDetail: true,
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
            uiAffects: {
                visibleBudgetNotification: false,
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
            uiAffects: {
                visibleAlertIcon: true,
                visibleUserNotification: false,
            },
        },
        V2: {
            menu: {
                [MENU_ID.SERVICE]: true,
                [MENU_ID.ALERTS]: true,
            },
            uiAffects: {
                visibleAlertIcon: false,
                visibleUserNotification: true,
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
