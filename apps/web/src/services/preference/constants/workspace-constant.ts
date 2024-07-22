import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/mirinae/types/inputs/search/query-search/type';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import * as styles from '@/styles/colors';

export const WORKSPACE_TABLE_FIELDS = [
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State', sortable: false },
    { name: 'users', label: 'Users' },
    { name: 'service_account_count', label: 'Service Accounts' },
    { name: 'cost_info', label: 'Cost' },
    { name: 'created_at', label: 'Created', sortable: false },
] as const;

export const EXCEL_TABLE_FIELDS: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'state', name: 'State' },
    { key: 'users', name: 'Users' },
    { key: 'service_account_count', name: 'Service Accounts' },
    { key: 'cost_info', name: 'Cost' },
    { key: 'created_at', name: 'Created At' },
];

export const WORKSPACE_STATE = {
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
    DORMANT: 'DORMANT',
} as const;

export const WORKSPACE_STATE_COLOR = {
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    DISABLED: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
    DORMANT: {
        iconColor: styles.coral[400],
        textColor: styles.coral[500],
    },
} as const;

export const WORKSPACE_SEARCH_HANDLERS = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'workspace_id', label: 'Workspace ID' },
            { name: 'name', label: 'Name' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    }] as KeyItemSet[],
    valueHandlerMap: {
        workspace_id: makeDistinctValueHandler('identity.Workspace', 'workspace_id'),
        name: makeDistinctValueHandler('identity.Workspace', 'name'),
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
