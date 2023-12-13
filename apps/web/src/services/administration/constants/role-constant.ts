import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';
import { MENU_ID } from '@/lib/menu/config';

export const ROLE_TYPE_BADGE_OPTION = {
    [ROLE_TYPE.DOMAIN_ADMIN]: { label: 'Admin', styleType: 'primary1' },
    [ROLE_TYPE.WORKSPACE_OWNER]: { label: 'Workspace Owner', styleType: 'secondary1' },
    [ROLE_TYPE.WORKSPACE_MEMBER]: { label: 'Workspace Member', styleType: 'gray500' },
} as const;

export const FORM_TYPE = {
    UPDATE: 'UPDATE',
    CREATE: 'CREATE',
} as const;

export const MANAGE_FEATURE_MAP = {
    [MENU_ID.DASHBOARDS_WORKSPACE]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_CUSTOMIZE',
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_DELETE',
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_CLONE',
        ],
    },
    [MENU_ID.DASHBOARDS_PROJECT]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_CUSTOMIZE',
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_DELETE',
            'IAM.ROLE.FORM.TOOLTIP_DASHBOARD_CLONE',
        ],
    },
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
            'IAM.ROLE.FORM.TOOLTIP_COLLECTOR_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
            'IAM.ROLE.FORM.TOOLTIP_TAG_EDIT',
            'IAM.ROLE.FORM.TOOLTIP_SCHEDULE_ADD',
            'IAM.ROLE.FORM.TOOLTIP_SCHEDULE_ACTION',
        ],
    },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_ADD_SERVICE_ACCOUNT',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
            'IAM.ROLE.FORM.TOOLTIP_TAG_EDIT',
        ],
    },
    [MENU_ID.COST_EXPLORER_BUDGET]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_BUDGET_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_BUDGET_DELETE',
            'IAM.ROLE.FORM.TOOLTIP_NOTIFICATION_SETTINGS',
        ],
    },
    [MENU_ID.ALERT_MANAGER_ALERT]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_ALERT_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ALERT_CHANGE_STATE',
            'IAM.ROLE.FORM.TOOLTIP_ALERT_DELETE',
            'IAM.ROLE.FORM.TOOLTIP_ALERT_URGENCY',
            'IAM.ROLE.FORM.TOOLTIP_ALERT_ASSIGN',
            'IAM.ROLE.FORM.TOOLTIP_PROJECT_CHANGE',
            'IAM.ROLE.FORM.TOOLTIP_ALERT_ADD_RESPONDER',
            'IAM.ROLE.FORM.TOOLTIP_ALERT_NOTE',
            'IAM.ROLE.FORM.TOOLTIP_ALERT_DESC_EDIT',
        ],
    },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_ESCALATION_POLICY_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
        ],
    },
    [MENU_ID.ADMINISTRATION_USER]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_ADD_USER',
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
            'IAM.ROLE.FORM.TOOLTIP_ROLE_CREATE',
        ],
    },
    [MENU_ID.ADMINISTRATION_POLICY]: {
        title: 'IAM.ROLE.FORM.TOOLTIP_ADMIN_FEATURES',
        features: [
            'IAM.ROLE.FORM.TOOLTIP_POLICY_CREATE',
            'IAM.ROLE.FORM.TOOLTIP_ACTION',
        ],
    },
};

const ROLE_TYPE_LABEL = {
    DOMAIN: {
        label: 'Admin',
        name: 'DOMAIN',
    },
    PROJECT: {
        label: 'User',
        name: 'PROJECT',
    },
} as const;

export const ROLE_SEARCH_HANDLERS = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'tags.description', label: 'Description' },
            { name: 'role_type', label: 'Role Type' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    }] as KeyItemSet[],
    valueHandlerMap: {
        name: makeDistinctValueHandler('identity.Role', 'name'),
        role_type: makeEnumValueHandler(ROLE_TYPE_LABEL),
        'tags.description': makeDistinctValueHandler('identity.Role', 'tags.description'),
        created_at: makeDistinctValueHandler('identity.Role', 'created_at', 'datetime'),
    },
} as const;

export const ROLE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'role_type', label: 'Role Type' },
    { name: 'created_at', label: 'Created', sortable: false },
    { name: 'edit_button', label: ' ', sortable: false },
] as const;

export const EXCEL_TABLE_FIELDS = [
    { key: 'name', name: 'Name' },
    { key: 'role_type', name: 'Role Type' },
    { key: 'created_at', name: 'Created' },
] as ExcelDataField[];

export const ROLE_DELETE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'role_type', label: 'Role Type' },
    { name: 'created_at', label: 'Created' },
] as const;

export const ROLE_UN_DELETABLE_TABLE_FIELDS = [
    { name: 'roleName', label: 'Role Name' },
    { name: 'roleType', label: 'Role Type' },
    { name: 'assignTo', label: 'Assigned To' },
] as const;
