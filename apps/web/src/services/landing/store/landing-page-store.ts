import { reactive } from 'vue';

import { defineStore } from 'pinia';


interface LandingPageStoreState {
    selectedWorkspaceGroupId: string;
    redirectPath?: string;
}

export const useLandingPageStore = defineStore('landing-page-store', () => {
    const state = reactive<LandingPageStoreState>({
        selectedWorkspaceGroupId: 'all',
        redirectPath: undefined,
    });

    const mutations = {
        setSelectedWorkspaceGroupId(workspaceGroupId: string) {
            state.selectedWorkspaceGroupId = workspaceGroupId;
        },
        setRedirectPath(redirectPath?: string) {
            state.redirectPath = redirectPath;
        },
    };

    const actions = {
        reset: () => {
            state.selectedWorkspaceGroupId = 'all';
            state.redirectPath = undefined;
        },
    };


    return {
        state,
        ...mutations,
        ...actions,
    };
});
