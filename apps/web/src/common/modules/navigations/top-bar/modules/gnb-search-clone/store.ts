import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

interface TopBarSearchStoreState {
    isActivated: boolean;
    inputText: string;
    activateTab: string;
    selectedWorkspaces: string[]; // Workspace Filter(TopBarSearchWorkspaceFilter)
}

export const useTopBarSearchStore = defineStore('gnb-search', () => {
    const state = reactive<TopBarSearchStoreState>({
        isActivated: false,
        inputText: '',
        activateTab: 'service',
        selectedWorkspaces: [],
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
        setIsActivated: (isActivated: boolean, initSearch = true) => {
            state.isActivated = isActivated;
            if (initSearch) {
                actions.initSearch();
            }
        },
        initSearch: () => {
            state.inputText = '';
            state.activateTab = 'service';
        },
        setSelectedWorkspaces: (selectedWorkspaces: string[]) => {
            state.selectedWorkspaces = selectedWorkspaces;
        },
    };


    return {
        state,
        getters,
        ...actions,
    };
});
