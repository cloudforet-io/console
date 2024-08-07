import type { KeyItemSet } from '@cloudforet/mirinae/types/inputs/search/query-search/type';

export const USER_GROUP_MODAL_TYPE = {
    ADD: 'add',
    EDIT: 'edit',
    STATUS: 'status',
    ADD_USERS: 'add_users',
} as const;

export const USER_GROUP_TABS = {
    DETAIL: 'detail',
    USER: 'user',
    WORKSPACE: 'workspace',
} as const;

export const USER_GROUP_SEARCH_HANDLERS = {
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
} as const;

export const USER_GROUP_STATE = {
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
} as const;
