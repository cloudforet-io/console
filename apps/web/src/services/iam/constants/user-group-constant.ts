import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

export const USER_GROUP_SEARCH_HANDLERS: KeyItemSet[] = [
    {
        title: 'Properties',
        items: [
            { name: 'name', label: 'User Group Name' },
            { name: 'users', label: 'Users' },
            { name: 'description', label: 'Description' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    },
];

export const USER_GROUP_TABS = {
    USERS: 'users',
    NOTIFICATION_CHANNEL: 'notification_channel',
};

export const USER_GROUP_USERS_SEARCH_HANDLERS: KeyItemSet[] = [
    {
        title: 'Properties',
        items: [
            { name: 'user_id', label: 'User ID' },
            { name: 'name', label: 'Name' },
            { name: 'auth_type', label: 'Auth Type' },
            { name: 'last_accessed_at', label: 'Last Activity', dataType: 'datetime' },
        ],
    },
];

export const USER_GROUP_MODAL_TYPE = {
    UPDATE: 'update',
    DELETE: 'delete',
    ADD_NEW_USER: 'add_new_user',
    REMOVE_USER: 'remove_user',
    CREATE: 'create',
    CREATE_NOTIFICATIONS_FIRST: 'create_notifications_step1',
    CREATE_NOTIFICATIONS_SECOND: 'create_notifications_step2',
    DELETE_NOTIFICATION_CHANNEL: 'delete_notification_channel',
};

export const USER_GROUP_CHANNELS_SEARCH_HANDLERS: KeyItemSet[] = [
    {
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            // { name: 'schedule', label: 'Schedule' },
        ],
    },
];
