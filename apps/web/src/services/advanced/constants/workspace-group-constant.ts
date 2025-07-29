import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

export const WORKSPACE_GROUP_MODAL_TYPE = {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    ADD_WORKSPACES: 'add_workspaces',
    ADD_USERS: 'add_users',
    REMOVE_GROUP_USER: 'remove_group_user',
    REMOVE_SINGLE_GROUP_USER: 'remove_single_group_user',
    REMOVE_WORKSPACES: 'remove_workspaces',
    REMOVE_SINGLE_WORKSPACE: 'remove_single_workspace',
} as const;

export const WORKSPACE_GROUP_TABS = {
    GROUP_USER: 'group_user',
    WORKSPACE: 'workspace',
} as const;

export const WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE = {
    FIRST: 'first',
    LAST: 'last',
} as const;

export const WORKSPACE_GROUP_SEARCH_HANDLERS = {
    keyItemSets: [
        {
            title: 'Properties',
            items: [
                { name: 'name', label: 'Name' },
                // { name: 'workspaces', label: 'Workspace' },
                // { name: 'users', label: 'Group User' },
                { name: 'created_at', label: 'Created', dataType: 'datetime' },
            ],
        },
        // {
        //     title: 'Advanced',
        //     items: [{
        //         name: 'tags',
        //         label: 'Tags',
        //         dataType: 'object',
        //     }],
        // }
    ] as KeyItemSet[],
};
