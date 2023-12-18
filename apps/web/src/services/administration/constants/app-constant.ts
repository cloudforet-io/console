import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';

import * as styles from '@/styles/colors';

const APP_STATE = {
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
    EXPIRED: 'EXPIRED',
} as const;
export const APP_DROPDOWN_MODAL_TYPE = {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    REGENERATE: 'regenerate',
    ENABLE: 'enable',
    DISABLE: 'disable',
} as const;

export const APP_STATE_COLOR = {
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    EXPIRED: {
        iconColor: styles.coral[500],
        textColor: styles.coral[500],
    },
    DISABLED: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
} as const;

export const APP_TABLE_FIELDS = [
    { name: 'name', label: 'App Name' },
    { name: 'state', label: 'State' },
    {
        name: 'app_id', label: 'App ID', sortable: false, disableCopy: false,
    },
    { name: 'role_id', label: 'Role ID' },
    { name: 'tags', label: 'Tags', sortable: false },
    { name: 'last_accessed_at', label: 'Last Activity' },
    { name: 'expired_at', label: 'Expiration Date' },
    { name: 'created_at', label: 'Created' },
];

export const APP_SEARCH_HANDLERS = {
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'app_id', label: 'App ID' },
                { name: 'role_id', label: 'Role ID' },
                {
                    name: 'last_accessed_at',
                    label: 'Last Activity',
                    dataType: 'datetime',
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
        name: makeDistinctValueHandler('identity.App', 'name'),
        state: makeEnumValueHandler(APP_STATE),
        app_id: makeDistinctValueHandler('identity.App', 'app_id'),
        role_id: makeDistinctValueHandler('identity.App', 'role_id'),
        last_accessed_at: makeDistinctValueHandler('identity.App', 'last_accessed_at', 'datetime'),
        tags: makeDistinctValueHandler('identity.App', 'tags'),
    },
};
