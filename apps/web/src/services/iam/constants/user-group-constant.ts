import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

export const USER_GROUP_SEARCH_HANDLERS = {
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'user_group_name', label: 'User Group Name' },
                { name: 'description', label: 'Description' },
                { name: 'notification', label: 'Notification' },
                { name: 'users', label: 'Users' },
                { name: 'created', label: 'Created', dataType: 'datetime' },
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

export const USER_GROUP_TABS = {
    USERS: 'users',
    NOTIFICATION_CHANNEL: 'notification_channel',
} as const;

export const USER_GROUP_USERS_SEARCH_HANDLERS = {
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'user_id', label: 'User ID' },
                { name: 'name', label: 'Name' },
                { name: 'auth_type', label: 'Auth Type' },
                { name: 'last_activity', label: 'Last Activity' },
            ],
        },
    ],
};

export const USER_GROUP_MODAL_TYPE = {
    UPDATE: 'update',
    REMOVE: 'remove',
    ADD_NEW_USER: 'add_new_user',
    CREATE: 'create',
};
