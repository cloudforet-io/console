import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ApiKeyDeleteParameters } from '@/schema/identity/api-key/api-verbs/delete';
import type { ApiKeyDisableParameters } from '@/schema/identity/api-key/api-verbs/disable';
import type { ApiKeyEnableParameters } from '@/schema/identity/api-key/api-verbs/enable';
import type { ApiKeyModel } from '@/schema/identity/api-key/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
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
        totalCount: 0,
        selectedIndices: [],
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
                users.push(state.users[d]);
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
                const res = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);
                this.users = res.results?.map((item) => ({
                    ...item,
                    role_type: item.role_binding_info.role_type,
                })) || [];
                this.totalCount = res.total_count ?? 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                this.totalCount = 0;
                throw e;
            }
        },
        // API Key
        async enableApiKey(params: ApiKeyEnableParameters) {
            try {
                await SpaceConnector.clientV2.identity.apiKey.enable<ApiKeyEnableParameters, ApiKeyModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async disableApiKey(params: ApiKeyDisableParameters) {
            try {
                await SpaceConnector.clientV2.identity.apiKey.disable<ApiKeyDisableParameters, ApiKeyModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async deleteApiKey(params: ApiKeyDeleteParameters) {
            try {
                await SpaceConnector.clientV2.identity.apiKey.delete<ApiKeyDeleteParameters>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
    },
});
