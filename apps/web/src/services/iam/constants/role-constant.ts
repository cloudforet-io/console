import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

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
    [ROLE_TYPE.SYSTEM_ADMIN]: {
        label: 'System Admin',
        name: 'SYSTEM_ADMIN',
    },
    [ROLE_TYPE.DOMAIN_ADMIN]: {
        label: 'Admin',
        name: 'DOMAIN_ADMIN',
    },
    [ROLE_TYPE.WORKSPACE_OWNER]: {
        label: 'Workspace Owner',
        name: 'WORKSPACE_OWNER',
    },
    [ROLE_TYPE.WORKSPACE_MEMBER]: {
        label: 'Workspace Member',
        name: 'WORKSPACE_MEMBER',
    },
    [ROLE_TYPE.USER]: {
        label: 'User',
        name: 'USER',
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
