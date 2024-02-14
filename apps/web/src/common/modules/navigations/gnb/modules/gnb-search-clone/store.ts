import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

interface GNBSearchStoreState {
    isActivated: boolean;
}

export const useGnbSearchStore = defineStore('gnb-search', () => {
    const state = reactive<GNBSearchStoreState>({
        isActivated: false,
    });

    const getters = reactive({
        isActivated: computed<boolean>(() => state.isActivated),
    });

    const actions = {
        setIsActivated(isActivated: boolean) {
            state.isActivated = isActivated;
        },
    };


    return {
        getters,
        ...actions,
    };
});
