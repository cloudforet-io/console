import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItem } from '@cloudforet/core-lib/component-util/query-search/type';

import * as styles from '@/styles/colors';

import { USER_STATE, USER_TYPE_LABEL } from '@/services/administration/iam/user/type';

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
                name: 'user_type',
                label: 'Access Control',
            },
            {
                name: 'backend',
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
        ] as KeyItem[],
    },
    {
        title: 'Advanced',
        items: [{
            name: 'tags',
            label: 'Tags',
            dataType: 'object',
        }],
    }],
    valueHandlerMap: {
        user_id: makeDistinctValueHandler('identity.User', 'user_id'),
        name: makeDistinctValueHandler('identity.User', 'name'),
        state: makeEnumValueHandler(USER_STATE),
        email: makeDistinctValueHandler('identity.User', 'email'),
        user_type: makeEnumValueHandler(USER_TYPE_LABEL),
        backend: makeDistinctValueHandler('identity.User', 'backend'),
        last_accessed_at: makeDistinctValueHandler('identity.User', 'last_accessed_at', 'datetime'),
        timezone: makeDistinctValueHandler('identity.User', 'timezone'),
        tags: makeDistinctValueHandler('identity.User', 'tags'),
    },
};

export const userStateColor = Object.freeze({
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
});

export const pluginStateColor = Object.freeze({
    ACTIVE: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    INACTIVE: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
});
