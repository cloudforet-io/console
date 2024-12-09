interface UserGroupSearchHandlers {
    title: string;
    items: {name: string; label: string; dataType?: string;}[]
}

export const USER_GROUP_SEARCH_HANDLERS: UserGroupSearchHandlers[] = [
    {
        title: 'Properties',
        items: [
            { name: 'user_group_id', label: 'User Group ID' },
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
    },
];

export const USER_GROUP_TABS = {
    USERS: 'users',
    NOTIFICATION_CHANNEL: 'notification_channel',
};

export const USER_GROUP_USERS_SEARCH_HANDLERS: UserGroupSearchHandlers[] = [
    {
        title: 'Properties',
        items: [
            { name: 'user_id', label: 'User ID' },
            { name: 'name', label: 'Name' },
            { name: 'auth_type', label: 'Auth Type' },
            { name: 'last_activity', label: 'Last Activity' },
        ],
    },
];

export const USER_GROUP_MODAL_TYPE = {
    UPDATE: 'update',
    REMOVE: 'remove',
    ADD_NEW_USER: 'add_new_user',
    CREATE: 'create',
};
