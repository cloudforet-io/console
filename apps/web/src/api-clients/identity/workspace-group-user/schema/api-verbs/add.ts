export interface WorkspaceGroupUserAddParameters {
    workspace_group_id: string;
    users: {user_id: string; role_id: string}[];
}
