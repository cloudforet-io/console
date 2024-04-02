import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { RoleModel } from '@/schema/identity/role/model';

interface LandingPageStoreState {
    loading: boolean;
    roleList: RoleModel[];
}

export const useLandingPageStore = defineStore('landing-page-store', () => {
    const state = reactive<LandingPageStoreState>({
        loading: false,
        roleList: [] as RoleModel[],
    });

    const getters = reactive({
        loading: computed<boolean>(() => state.loading),
        roleList: computed<RoleModel[]>(() => state.roleList),
    });

    const actions = {
        setLoading: (loading: boolean) => {
            state.loading = loading;
        },
        // TODO: will be updated
        // listRoles: async () => {
        //     try {
        //         const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
        //             query: {
        //                 filter: [
        //                     { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
        //                 ],
        //             },
        //         });
        //         state.roleList = results || [];
        //     } catch (e) {
        //         ErrorHandler.handleError(e);
        //         state.roleList = [];
        //     }
        // },
        initState: () => {
            state.loading = false;
        },
    };


    return {
        getters,
        ...actions,
    };
});
