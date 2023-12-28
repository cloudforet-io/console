import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import * as styles from '@/styles/colors';

export const PASSWORD_TYPE = {
    KEEP: 'KEEP',
    RESET: 'RESET',
    MANUALLY: 'MANUALLY',
} as const;

export const USER_MODAL_TYPE = {
    REMOVE: 'remove',
    ADD: 'add',
    INVITE: 'invite',
    DELETE: 'delete',
    ENABLE: 'enable',
    DISABLE: 'disable',
    UPDATE: 'update',
} as const;

// Table
export const USER_STATE = {
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
} as const;

export const USER_STATE_COLOR = {
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    PENDING: {
        iconColor: styles.yellow[500],
        textColor: styles.gray[900],
    },
    DISABLED: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
} as const;
export const USER_MFA_COLOR = {
    ON: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    OFF: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
} as const;

export const USER_SEARCH_HANDLERS = {
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
        },
        {
            title: 'Advanced',
            items: [{
                name: 'tags',
                label: 'Tags',
                dataType: 'object',
            }],
        }] as KeyItemSet[],
};

export const USER_STATUS_TABLE_FIELDS = [
    { name: 'user_id', label: 'User ID' },
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'role_type', label: 'Workspace Role Type' },
] as const;

// Tab
export const USER_TAB_TABLE_FIELDS = [
    { name: 'user_id', label: 'User ID', sortable: false },
    { name: 'name', label: 'Name', sortable: false },
    { name: 'state', label: 'State', sortable: false },
    { name: 'role_type', label: 'Workspace Role', sortable: false },
    { name: 'tags', label: 'Tags' },
    { name: 'auth_type', label: 'Auth Type', sortable: false },
    { name: 'last_accessed_at', label: 'Last Activity', sortable: false },
    { name: 'timezone', label: 'Timezone', sortable: false },
] as const;

export const USER_TABS = {
    DETAIL: 'detail',
    WORKSPACE: 'workspace',
    PROJECTS: 'projects',
    TAG: 'tag',
    API_KEY: 'api_key',
    DATA: 'data',
} as const;

