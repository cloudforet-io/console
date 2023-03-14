import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { RoleData } from '@/services/administration/iam/role/type';


export const useRolePageStore = defineStore('role-page', () => {
    const state = reactive({
        loading: false,
        roles: [] as RoleData[],
        totalCount: 0,
        selectedIndices: [] as number[],
    });
    const getters = reactive({
        selectedRoles: computed<RoleData[]>(() => state.selectedIndices.map((d) => state.roles[d]) || []),
    });

    /* Actions */
    const listRoles = async (apiQuery: Query) => {
        state.loading = true;
        try {
            const res = await SpaceConnector.client.identity.role.list({
                query: apiQuery,
            });
            state.roles = res.results;
            state.totalCount = res.total_count;
            state.selectedIndices = [];
        } catch (e) {
            ErrorHandler.handleError(e);
            state.roles = [];
            state.totalCount = 0;
        } finally {
            state.loading = false;
        }
    };

    return {
        state,
        getters,
        listRoles,
    };
});
