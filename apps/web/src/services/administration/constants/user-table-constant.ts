import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';

import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import * as styles from '@/styles/colors';

const USER_STATE = {
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
} as const;

export const userStateColor = {
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

export const pluginStateColor = {
    ACTIVE: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    INACTIVE: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
} as const;

export const userSearchHandlers = {
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

export const userTableFields = [
    { name: 'user_id', label: 'User ID', sortable: false },
    { name: 'name', label: 'Name', sortable: false },
    { name: 'state', label: 'State', sortable: false },
    { name: 'api_key_count', label: 'API Key' },
    { name: 'role_type', label: 'Role' },
    { name: 'tags', label: 'Tags' },
    { name: 'auth_type', label: 'Auth Type', sortable: false },
    { name: 'last_accessed_at', label: 'Last Activity', sortable: false },
    { name: 'timezone', label: 'Timezone', sortable: false },
];

export const userExcelFields:ExcelDataField[] = [
    { key: 'user_id', name: 'User ID' },
    { key: 'name', name: 'Name' },
    { key: 'state', name: 'State' },
    { key: 'api_key_count', name: 'API Key' },
    { key: 'role_type', name: 'Role' },
    { key: 'auth_type', name: 'Auth Type' },
    { key: 'last_accessed_at', name: 'Last Activity', type: 'datetime' },
    { key: 'timezone', name: 'Timezone' },
];
