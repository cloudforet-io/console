import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';

import * as styles from '@/styles/colors';

const USER_STATE = {
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
    keyItemSets: [{
        title: 'Properties',
        items: [
            {
                name: 'user_id',
                label: 'User ID',
            },
            {
                name: 'name',
                label: 'Name',
            },
            {
                name: 'state',
                label: 'State',
            },
            {
                name: 'email',
                label: 'E-mail',
            },
            {
                name: 'auth_type',
                label: 'Auth Type',
            },
            {
                name: 'last_accessed_at',
                label: 'Last Activity',
                dataType: 'datetime',
            },
            {
                name: 'timezone',
                label: 'Timezone',
            },
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
    valueHandlerMap: {
        user_id: makeDistinctValueHandler('identity.User', 'user_id'),
        name: makeDistinctValueHandler('identity.User', 'name'),
        state: makeEnumValueHandler(USER_STATE),
        email: makeDistinctValueHandler('identity.User', 'email'),
        auth_type: makeDistinctValueHandler('identity.User', 'auth_type'),
        last_accessed_at: makeDistinctValueHandler('identity.User', 'last_accessed_at', 'datetime'),
        timezone: makeDistinctValueHandler('identity.User', 'timezone'),
        tags: makeDistinctValueHandler('identity.User', 'tags'),
    },
};

export const USER_TABLE_FIELDS = [
    { name: 'user_id', label: 'User ID', sortable: false },
    { name: 'name', label: 'Name', sortable: false },
    { name: 'state', label: 'State', sortable: false },
    { name: 'mfa', label: 'Multi-factor Auth', sortable: false },
    { name: 'api_key_count', label: 'API Key' },
    { name: 'role_type', label: 'Role', sortable: false },
    { name: 'tags', label: 'Tags' },
    { name: 'auth_type', label: 'Auth Type', sortable: false },
    { name: 'last_accessed_at', label: 'Last Activity', sortable: false },
    { name: 'timezone', label: 'Timezone', sortable: false },
];

export const USER_STATUS_TABLE_FIELDS = [
    { name: 'user_id', label: 'User ID' },
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'role_type', label: 'Workspace Role Type' },
];
