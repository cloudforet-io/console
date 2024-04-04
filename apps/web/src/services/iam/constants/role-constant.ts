import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';

import { ROLE_TYPE } from '@/schema/identity/role/constant';

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

export const ROLE_TAB_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'role_type', label: 'Role Type' },
    { name: 'created_at', label: 'Created', sortable: false },
] as const;

export const MANAGED_PAGE_ACCESS = [
    '*',
] as const;
