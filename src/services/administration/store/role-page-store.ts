import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { RoleData } from '@/services/administration/iam/role/type';


interface RolePageState {
    loading: boolean;
    roles: RoleData[];
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
        async listRoles(apiQuery: Query) {
            this.loading = true;
            try {
                const res = await SpaceConnector.client.identity.role.list({
                    query: apiQuery,
                });
                this.roles = res.results;
                this.totalCount = res.total_count;
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
