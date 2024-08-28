import type { RoleBindingModel } from '@/schema/identity/role-binding/model';

export const getWorkspaceRoleBindingIdFromRoleBindingsInfo = (roleBindingsInfo:RoleBindingModel[])
    :RoleBindingModel|undefined => roleBindingsInfo.find((rbi) => (rbi.workspace_id && !rbi.workspace_group_id));
