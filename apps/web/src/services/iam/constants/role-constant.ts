import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { SERVICE_FEATURES } from '@/lib/config/global-config/constants/constants';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';
import { MENU_ID } from '@/lib/menu/config';

import type { PageAccessMenuByConfig } from '@/services/iam/types/role-type';

export const ROLE_TYPE_BADGE_OPTION = {
    [ROLE_TYPE.DOMAIN_ADMIN]: { label: 'Admin' },
    [ROLE_TYPE.WORKSPACE_OWNER]: { label: 'Workspace Owner' },
    [ROLE_TYPE.WORKSPACE_MEMBER]: { label: 'Workspace Member' },
} as const;

export const FORM_TYPE = {
    UPDATE: 'UPDATE',
    CREATE: 'CREATE',
} as const;

const ROLE_STATE_MAP = {
    ENABLED: {
        label: 'Enabled',
        name: 'ENABLED',
    },
    DISABLED: {
        label: 'Disabled',
        name: 'DISABLED',
    },
} as const;

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
            { name: 'state', label: 'State' },
            { name: 'role_type', label: 'Role Type' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    }] as KeyItemSet[],
    valueHandlerMap: {
        name: makeDistinctValueHandler('identity.Role', 'name'),
        role_type: makeEnumValueHandler(ROLE_TYPE_LABEL),
        state: makeEnumValueHandler(ROLE_STATE_MAP),
        'tags.description': makeDistinctValueHandler('identity.Role', 'tags.description'),
        created_at: makeDistinctValueHandler('identity.Role', 'created_at', 'datetime'),
    },
} as const;

export const EXCEL_TABLE_FIELDS = [
    { key: 'name', name: 'Name' },
    { key: 'role_type', name: 'Role Type' },
    { key: 'created_at', name: 'Created' },
] as ExcelDataField[];

export const ROLE_MODAL_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'role_type', label: 'Role Type' },
    { name: 'created_at', label: 'Created' },
] as const;

export const ROLE_UN_DELETABLE_TABLE_FIELDS = [
    { name: 'roleName', label: 'Role Name' },
    { name: 'roleType', label: 'Role Type' },
    { name: 'assignTo', label: 'Assigned To' },
] as const;

export const ROLE_TAB_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'role_type', label: 'Role Type' },
    { name: 'created_at', label: 'Created', sortable: false },
] as const;

export const MANAGED_PAGE_ACCESS = [
    '*',
] as const;

export const DEFAULT_WORKSPACE_PAGE_ACCESS_MENU_LIST: PageAccessMenuByConfig[] = [
    { id: MENU_ID.DASHBOARDS, key: SERVICE_FEATURES.DASHBOARDS },
    { id: MENU_ID.SERVICE_ACCOUNT, key: SERVICE_FEATURES.SERVICE_ACCOUNT },
    { id: MENU_ID.PROJECT, key: SERVICE_FEATURES.PROJECT },
    {
        id: MENU_ID.ASSET_INVENTORY,
        key: SERVICE_FEATURES.ASSET_INVENTORY,
        subMenuList: [
            { id: MENU_ID.CLOUD_SERVICE },
            { id: MENU_ID.SERVER },
            { id: MENU_ID.SECURITY },
            { id: MENU_ID.METRIC_EXPLORER },
            { id: MENU_ID.COLLECTOR },
        ],
    },
    {
        id: MENU_ID.COST_EXPLORER,
        key: SERVICE_FEATURES.COST_EXPLORER,
        subMenuList: [
            { id: MENU_ID.COST_ANALYSIS },
            { id: MENU_ID.BUDGET },
            { id: MENU_ID.COST_REPORT },
        ],
    },
    {
        id: MENU_ID.OPS_FLOW,
        key: SERVICE_FEATURES.OPS_FLOW,
        subMenuList: [
            { id: MENU_ID.OPS_FLOW_LANDING },
            { id: MENU_ID.TASK_BOARD },
        ],
    },
];
export const ALERT_V2_WORKSPACE_PAGE_ACCESS_MENU_LIST: PageAccessMenuByConfig[] = [
    {
        id: MENU_ID.ALERT_MANAGER,
        key: SERVICE_FEATURES.ALERT_MANAGER,
        subMenuList: [
            { id: MENU_ID.SERVICE },
            { id: MENU_ID.ALERTS },
        ],
    },
    {
        id: MENU_ID.IAM,
        key: SERVICE_FEATURES.IAM,
        subMenuList: [
            { id: MENU_ID.USER },
            { id: MENU_ID.USER_GROUP },
            { id: MENU_ID.APP },
        ],
    },
];

export const ALERT_V1_WORKSPACE_PAGE_ACCESS_MENU_LIST: PageAccessMenuByConfig[] = [
    {
        id: MENU_ID.ALERT_MANAGER,
        key: SERVICE_FEATURES.ALERT_MANAGER,
        subMenuList: [
            { id: MENU_ID.ALERT_MANAGER_DASHBOARD },
            { id: MENU_ID.ALERTS },
            { id: MENU_ID.ESCALATION_POLICY },
        ],
    },
    {
        id: MENU_ID.IAM,
        key: SERVICE_FEATURES.IAM,
        subMenuList: [
            { id: MENU_ID.USER },
            { id: MENU_ID.APP },
        ],
    },
];
