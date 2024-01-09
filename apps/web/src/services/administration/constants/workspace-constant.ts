import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

export const WORKSPACE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'tags.description', label: 'Description', sortable: false },
    { name: 'state', label: 'State', sortable: false },
    { name: 'users', label: 'Users', sortable: false },
    { name: 'created_at', label: 'Created', sortable: false },
] as const;

export const EXCEL_TABLE_FIELDS: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'state', name: 'State' },
    { key: 'users', name: 'Users' },
    { key: 'created_at', name: 'Created At' },
];

export const WORKSPACE_STATE = {
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
} as const;

export const WORKSPACE_SEARCH_HANDLERS = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'workspace_id', label: 'Workspace ID' },
            { name: 'name', label: 'Name' },
            { name: 'tags.description', label: 'Description' },
            { name: 'state', label: 'State' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    }] as KeyItemSet[],
    valueHandlerMap: {
        workspace_id: makeDistinctValueHandler('identity.Workspace', 'workspace_id'),
        name: makeDistinctValueHandler('identity.Workspace', 'name'),
        'tags.description': makeDistinctValueHandler('identity.Workspace', 'tags.description'),
        state: makeEnumValueHandler(WORKSPACE_STATE),
        created_at: makeDistinctValueHandler('identity.Workspace', 'created_at', 'datetime'),
    },
} as const;


export const WORKSPACES_USER_SEARCH_HANDLERS = {
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'user_id', label: 'User ID' },
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'email', label: 'E-mail' },
                { name: 'auth_type', label: 'Auth Type' },
                {
                    name: 'last_accessed_at',
                    label: 'Last Activity',
                    dataType: 'datetime',
                },
                { name: 'timezone', label: 'Timezone' },
            ],
        }] as KeyItemSet[],
};
