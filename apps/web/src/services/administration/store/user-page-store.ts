import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { UserListItemType } from '@/services/administration/types/user-type';

export const useUserPageStore = defineStore('user-page', {
    state: () => ({
        isAdminMode: false,
        loading: false,
        users: [] as UserListItemType[],
        roles: [] as RoleModel[],
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: {
                add: false,
                form: false,
                status: false,
            },
        },
    }),
    getters: {
        timezone: () => store.state.user.timezone,
        isWorkspaceOwner: () => store.state.user.currentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_OWNER,
        selectedUsers: (state) => {
            const users: UserListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                users.push({
                    ...state.users[d],
                    role_type: state.isAdminMode ? state.users[d].role_type : state.users[d]?.role_binding_info?.role_type,
                    role_binding: {
                        type: state.users[d].role_binding_info?.role_type as RoleType,
                        name: state.roles.find((role) => role.role_id === state.users[d]?.role_binding_info?.role_id)?.name ?? '',
                    },
                });
            });
            return users ?? [];
        },
    },
    actions: {
        // User
        async listUsers(params: UserListParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>(params);
                this.users = res.results || [];
                this.totalCount = res.total_count ?? 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                this.totalCount = 0;
                throw e;
            }
        },
        // Workspace User
        async listWorkspaceUsers(params: WorkspaceUserListParameters) {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);
                this.users = (results ?? [])?.map((item) => ({
                    ...item,
                    role_type: item.role_binding_info.role_type,
                }));
                this.totalCount = total_count ?? 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                this.totalCount = 0;
                throw e;
            }
        },
        // Role
        async listRoles(params?: RoleListParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);
                this.roles = results || [];
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.roles = [];
                throw e;
            }
        },
    },
});
