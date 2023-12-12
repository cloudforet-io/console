import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleDeleteParameters } from '@/schema/identity/role-binding/api-verbs/delete';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';
import type { FindUserParameters } from '@/schema/identity/user/api-verbs/find';
import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceUserCreateParameters } from '@/schema/identity/workspace-user/api-verbs/create';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useUserModalSettingStore = defineStore('user-modal-setting', {
    state: () => ({
        mode: '',
        title: '',
        themeColor: 'primary',
        visible: {
            additional: false,
            form: false,
            status: false,
        },
    }),
    getters: {
    },
    actions: {
        async listUsers(params: FindUserParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.user.find<FindUserParameters, ListResponse<UserModel>>(params);
                return res.results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        },
        async listRoles(params: RoleListParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);
                return results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        },
        //
        async getWorkspaceUser(params: WorkspaceUserListParameters) {
            try {
                return await SpaceConnector.clientV2.identity.workspaceUser.get<WorkspaceUserListParameters, WorkspaceUserModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                return {};
            }
        },
        async createWorkspaceUser(params: WorkspaceUserCreateParameters) {
            try {
                await SpaceConnector.clientV2.identity.workspaceUser.create<WorkspaceUserCreateParameters, WorkspaceUserModel>(params);
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        //
        async createRoleBinding(params: RoleCreateParameters) {
            try {
                await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async deleteRoleBinding(params: RoleDeleteParameters) {
            try {
                await SpaceConnector.clientV2.identity.roleBinding.delete<RoleDeleteParameters>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
    },
});
