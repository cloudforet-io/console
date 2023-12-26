import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface RolePageState {
    loading: boolean;
    roles: RoleModel[];
    totalCount: number;
    selectedIndices: number[];
    pageStart: number,
    pageLimit: number,
}

export const useRolePageStore = defineStore('role-page', {
    state: (): RolePageState => ({
        loading: false,
        roles: [] as RoleModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
    }),
    getters: {
        selectedRoles: (state) => state.selectedIndices.reduce((refined: RoleModel[], idx: number) => {
            if (state.roles[idx].role_type !== ROLE_TYPE.SYSTEM_ADMIN) {
                refined.push(state.roles[idx]);
            }
            return refined;
        }, []),
    },
    actions: {
        async listRoles(params: RoleListParameters) {
            this.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);
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
    },
});
