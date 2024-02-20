import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

interface GNBSearchStoreState {
    isActivated: boolean;
    inputText: string;
    activateTab: string;
}

export const useTopBarSearchStore = defineStore('gnb-search', () => {
    const state = reactive<GNBSearchStoreState>({
        isActivated: false,
        inputText: '',
        activateTab: 'service',
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
        setIsActivated(isActivated: boolean, initSearch = true) {
            state.isActivated = isActivated;
            if (initSearch) {
                actions.initSearch();
            }
        },
        initSearch() {
            state.inputText = '';
            state.activateTab = 'service';
        },
    };


    return {
        state,
        getters,
        ...actions,
    };
});
