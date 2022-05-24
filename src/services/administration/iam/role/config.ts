import { MENU_ID } from '@/lib/menu/config';

export const ROLE_TYPE = Object.freeze({
    SYSTEM: 'SYSTEM',
    PROJECT: 'PROJECT',
    DOMAIN: 'DOMAIN',
} as const);
export type RoleType = typeof ROLE_TYPE[keyof typeof ROLE_TYPE];

export const ROLE_TYPE_LABEL = Object.freeze({
    DOMAIN: {
        label: 'Admin',
    },
    PROJECT: {
        label: 'User',
    },
} as const);

export const ROLE_TYPE_BADGE_OPTION = Object.freeze({
    [ROLE_TYPE.SYSTEM]: { label: 'System', styleType: 'secondary1' },
    [ROLE_TYPE.DOMAIN]: { label: 'Admin', styleType: 'primary1' },
    [ROLE_TYPE.PROJECT]: { label: 'User', styleType: 'gray' },
});

export const FORM_TYPE = Object.freeze({
    UPDATE: 'UPDATE',
    CREATE: 'CREATE',
} as const);

export const MANAGE_FEATURE_MAP = {
    [MENU_ID.PROJECT]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_PROJECT', // Manage Project Group & Project
        ],
    },
    [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: ['IAM.ROLE.FORM.TOOLTIP_TAG_EDIT'],
    },
    [MENU_ID.ASSET_INVENTORY_SERVER]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: ['IAM.ROLE.FORM.TOOLTIP_TAG_EDIT'],
    },
    [MENU_ID.ASSET_INVENTORY_COLLECTOR]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
            'IAM.ROLE.FORM.TOOLTIP_TAG_EDIT',
            'IAM.ROLE.FORM.TOOLTIP_SCHEDULE_ADD',
            'IAM.ROLE.FORM.TOOLTIP_SCHEDULE_ACTION',
        ],
    },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_ADD',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
            'IAM.ROLE.FORM.TOOLTIP_TAG_EDIT',
        ],
    },
    [MENU_ID.COST_EXPLORER_DASHBOARD]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_PUBLIC_DUPLICATE',
            'IAM.ROLE.FORM.TOOLTIP_PUBLIC_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_PUBLIC_FIX_DATE',
            'IAM.ROLE.FORM.TOOLTIP_PUBLIC_FILTER',
            'IAM.ROLE.FORM.TOOLTIP_PUBLIC_CUSTOMIZE',
            'IAM.ROLE.FORM.TOOLTIP_PUBLIC_DELETE',
        ],
    },
    [MENU_ID.COST_EXPLORER_COST_ANALYSIS]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [],
    },
    [MENU_ID.COST_EXPLORER_BUDGET]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_DELETE',
            'IAM.ROLE.FORM.TOOLTIP_NOTIFICATION_SETTINGS',
        ],
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ACKNOWLEDGE',
            'IAM.ROLE.FORM.TOOLTIP_RESOLVE',
            'IAM.ROLE.FORM.TOOLTIP_DELETE',
        ],
    },
    [MENU_ID.ALERT_MANAGER_ALERT]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_STATE',
            'IAM.ROLE.FORM.TOOLTIP_URGENCY',
            'IAM.ROLE.FORM.TOOLTIP_ASSIGNED_TO',
            'IAM.ROLE.FORM.TOOLTIP_PROJECT_CHANGE',
            'IAM.ROLE.FORM.TOOLTIP_ADDITIONAL_RESPONDER',
            'IAM.ROLE.FORM.TOOLTIP_NOTE',
            'IAM.ROLE.FORM.TOOLTIP_EDIT_DELETE',
            'IAM.ROLE.FORM.TOOLTIP_DESC_EDIT',
        ],
    },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
        ],
    },
    [MENU_ID.ADMINISTRATION_USER]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_ADD',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
            'IAM.ROLE.FORM.TOOLTIP_TAG_EDIT',
            'IAM.ROLE.FORM.TOOLTIP_API_KEY_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_API_KEY_ACTION',
            'IAM.ROLE.FORM.TOOLTIP_NOTIFICATION_MANAGE',
        ],
    },
    [MENU_ID.ADMINISTRATION_ROLE]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_CREATE',
        ],
    },
    [MENU_ID.ADMINISTRATION_POLICY]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
        ],
    },
};
