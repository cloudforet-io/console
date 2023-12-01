import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/model';
import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface RolePageState {
    loading: boolean;
    roles: RoleModel[];
    totalCount: number;
    selectedIndices: number[];
}

export const useRolePageStore = defineStore('role-page', {
    state: (): RolePageState => ({
        loading: false,
        roles: [],
        totalCount: 0,
        selectedIndices: [],
    }),
    getters: {
        selectedRoles: (state) => state.selectedIndices.map((d) => state.roles[d]) || [],
    },
    actions: {
        async listRoles(params: RoleListParameters) {
            const { query } = params;
            this.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
                    query,
                });
                this.roles = results || [];
                this.totalCount = total_count || 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.roles = [];
                this.totalCount = 0;
            } finally {
                this.loading = false;
            }
        },
        async getRoleDetail(params: RoleGetParameters) {
            const { role_id } = params;
            try {
                return await SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>({
                    role_id,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
    },
});
