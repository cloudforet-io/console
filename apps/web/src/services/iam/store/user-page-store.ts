import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import type { FindWorkspaceUserParameters } from '@/schema/identity/workspace-user/api-verbs/find';
import type { WorkspaceUserGetParameters } from '@/schema/identity/workspace-user/api-verbs/get';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel, SummaryWorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getWorkspaceRoleBindingIdFromRoleBindingsInfo } from '@/services/iam/helpers/role-binding-helpers';
import type { UserListItemType } from '@/services/iam/types/user-type';

export const useUserPageStore = defineStore('page-user', {
    state: () => ({
        isAdminMode: false,
        loading: true,
        users: [] as UserListItemType[],
        selectedUser: {} as UserListItemType,
        roles: [] as RoleModel[],
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
        // This is for workspace created case in admin mode
        afterWorkspaceCreated: false,
        createdWorkspaceId: undefined as string | undefined,
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
        isWorkspaceOwner: () => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER,
        selectedUsers: (state):UserListItemType[] => {
            if (state.selectedIndices.length === 1 && !isEmpty(state.selectedUser)) return [state.selectedUser];
            const users: UserListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                users.push(state.users[d]);
            });
            return users ?? [];
        },
        roleMap: (state) => {
            const map: Record<string, RoleModel> = {};
            state.roles.forEach((role) => {
                map[role.role_id] = role;
            });
            return map;
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
        async getUser(params: UserGetParameters) {
            try {
                this.selectedUser = await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>(params);
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        // Workspace User
        async listWorkspaceUsers(params: WorkspaceUserListParameters) {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);
                this.users = (results ?? [])?.map((item) => {
                    const workspaceRoleBinding = getWorkspaceRoleBindingIdFromRoleBindingsInfo(item.role_bindings_info);
                    return ({
                        ...item,
                        role_type: item.role_type,
                        role_binding: {
                            type: workspaceRoleBinding?.role_type ?? ROLE_TYPE.USER,
                            name: this.roles.find((role) => role.role_id === workspaceRoleBinding?.role_id)?.name ?? '',
                        },
                    });
                });
                this.totalCount = total_count ?? 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                this.totalCount = 0;
                throw e;
            }
        },
        async getWorkspaceUser(params: WorkspaceUserGetParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.workspaceUser.get<WorkspaceUserGetParameters, WorkspaceUserModel>(params);
                const workspaceRoleBinding = getWorkspaceRoleBindingIdFromRoleBindingsInfo(res.role_bindings_info);
                return {
                    ...res,
                    role_type: res.role_type,
                    role_binding: {
                        type: workspaceRoleBinding?.role_type ?? ROLE_TYPE.USER,
                        name: this.roles.find((role) => role.role_id === workspaceRoleBinding?.role_id)?.name ?? '',
                    },
                };
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        async findWorkspaceUser(params?: FindWorkspaceUserParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.identity.workspaceUser.find<FindWorkspaceUserParameters, ListResponse<SummaryWorkspaceUserModel>>(params);
                return results || [];
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        setUserEmail(userId?: string, email?: string) {
            const idx = this.users.findIndex((item) => item.user_id === userId);
            this.users[idx].email = email;
            if (this.selectedUser.user_id === userId) {
                this.selectedUser.email = email;
            }
        },
        // Role
        async listRoles() {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>();
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
