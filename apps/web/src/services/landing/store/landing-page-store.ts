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
        initState: () => {
            state.loading = false;
        },
    };


    return {
        getters,
        ...actions,
    };
});
