import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

interface GNBSearchStoreState {
    isActivated: boolean;
    inputText: string;
}

export const useTopBarSearchStore = defineStore('gnb-search', () => {
    const state = reactive<GNBSearchStoreState>({
        isActivated: false,
        inputText: '',
    });

    const getters = reactive({
        isActivated: computed<boolean>(() => state.isActivated),
        inputText: computed<string>(() => state.inputText),
        trimmedInputText: computed<string>(() => {
            if (state.inputText) return state.inputText.trim();
            return '';
        }),
    });

    const actions = {
        setIsActivated(isActivated: boolean) {
            state.isActivated = isActivated;
        },
    };


    return {
        state,
        getters,
        ...actions,
    };
});
