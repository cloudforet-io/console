import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleCreateParameters } from '@/schema/identity/role-binding/api-verbs/create';
import type { RoleDeleteParameters } from '@/schema/identity/role-binding/api-verbs/delete';
import type { RoleBindingListParameters } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useUserPageStore = defineStore('user-page', {
    state: () => ({
        loading: false,
        modalLoading: false,
        users: [] as UserModel[],
        totalCount: 0,
        selectedIndices: [],
        visibleStatusModal: false,
        visibleCreateModal: false,
        visibleUpdateModal: false,
    }),
    getters: {
        timezone: () => store.state.user.timezone || 'UTC',
        selectedUsers: (state): UserModel[] => {
            const users = [] as UserModel[];
            state.selectedIndices.forEach((d) => {
                users.push(state.users[d]);
            });
            return users ?? [];
        },
    },
    actions: {
        async listUsers(params: UserListParameters) {
            this.loading = true;
            try {
                const res = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>(params);
                this.users = res.results || [];
                this.totalCount = res.total_count ?? 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                this.totalCount = 0;
            } finally {
                this.loading = false;
            }
        },
        async createRoleBinding(params: RoleCreateParameters) {
            try {
                await SpaceConnector.clientV2.identity.roleBinding.create<RoleCreateParameters, RoleBindingModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        async listRoleBindings(params: RoleBindingListParameters) {
            const { domain_id } = params;
            try {
                const { results } = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>(params);
                const roleBindingId = results?.[0].role_binding_id;
                if (roleBindingId) {
                    await this.deleteRoleBinding({
                        role_binding_id: roleBindingId,
                        domain_id,
                    });
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        async deleteRoleBinding(params: RoleDeleteParameters) {
            try {
                await SpaceConnector.clientV2.identity.roleBinding.delete<RoleDeleteParameters>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    },
});
