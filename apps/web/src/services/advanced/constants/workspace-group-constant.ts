export const WORKSPACE_GROUP_MODAL_TYPE = {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    REMOVE_GROUP_USER: 'remove_group_user',
    REMOVE_WORKSPACES: 'remove_workspaces',
} as const;

export const WORKSPACE_GROUP_TABS = {
    GROUP_USER: 'group_user',
    WORKSPACE: 'workspace',
} as const;

export const WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE = {
    FIRST: 'first',
    LAST: 'last',
} as const;
