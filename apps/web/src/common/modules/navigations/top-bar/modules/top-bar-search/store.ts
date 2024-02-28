import { computed, reactive, watch } from 'vue';

import { debounce } from 'lodash';
import { defineStore } from 'pinia';

interface TopBarSearchStoreState {
    isActivated: boolean;
    inputText: string;
    activateTab: string;
    recentMenuList: any[]; // TODO: check type
    searchMenuMap: any; // TODO: check type
    // workspace filter
    recentAccessedWorkspaces: string[];
    stagedWorkspaces: string[];
    selectedWorkspaces: string[]; // Workspace Filter(TopBarSearchWorkspaceFilter)
}

export const useTopBarSearchStore = defineStore('top-bar-search', () => {
    const state = reactive<TopBarSearchStoreState>({
        isActivated: false,
        inputText: '',
        activateTab: 'service',
        recentMenuList: [],
        searchMenuMap: {},
        // workspace filter
        recentAccessedWorkspaces: [],
        stagedWorkspaces: [],
        selectedWorkspaces: [],
    });

    const getters = reactive({
        isActivated: computed<boolean>(() => state.isActivated),
        inputText: computed<string>(() => state.inputText),
        trimmedInputText: computed<string>(() => {
            if (state.inputText) return state.inputText.trim();
            return '';
        }),
        isRecentEmpty: computed<boolean>(() => state.recentMenuList.length === 0),
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
            state.selectedWorkspaces = [];
        },
        setSelectedWorkspaces: (selectedWorkspaces: string[]) => {
            state.selectedWorkspaces = selectedWorkspaces;
        },
    };

    watch(() => getters.trimmedInputText, debounce(async (trimmedText) => {
        if (trimmedText) {
            // state.searchMenuList = fetchSearchList(trimmedText);
            // state.recentMenuList = fetchRecentList(trimmedText);
            state.searchMenuMap = {
                'workspace-c0aa5bc7f065': [
                    { id: 1, label: "이거슨 B's Workspace의 project", icon: 'ic_document-filled' },
                    { id: 2, label: 'test2', icon: 'ic_folder-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
                'workspace-06250ad7066d': [
                    { id: 1, label: '크리수마수', icon: 'ic_document-filled' },
                    { id: 2, label: 'test2', icon: 'ic_folder-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
                'workspace-fa3255244984': [
                    { id: 1, label: '바뤼스타', icon: 'ic_document-filled' },
                    { id: 2, label: 'test2', icon: 'ic_folder-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
                'workspace-1dbbf68c80f3': [
                    { id: 1, label: 'EKS', icon: 'ic_document-filled' },
                    { id: 2, label: 'test2', icon: 'ic_folder-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
                'workspace-fdf1974e2b21': [
                    { id: 1, label: 'GCP', icon: 'ic_document-filled' },
                    { id: 2, label: 'test2', icon: 'ic_folder-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
                'workspace-5fe20947c13e': [
                    { id: 1, label: 'GCP W', icon: 'ic_document-filled' },
                    { id: 2, label: 'ic_folder-filled', icon: 'ic_document-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
                'workspace-53590feed87e': [
                    { id: 1, label: 'JSA', icon: 'ic_document-filled' },
                    { id: 2, label: 'ic_document-filled', icon: 'ic_document-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
                'workspace-7a0aebcf4eb2': [
                    { id: 1, label: 'SpaceONE', icon: 'ic_document-filled' },
                    { id: 2, label: 'test2', icon: 'ic_document-filled' },
                    { id: 3, label: 'test3', icon: 'ic_favorite-filled' },
                ],
            };
            state.recentMenuList = [
                { id: 1, label: 'recent > test', icon: 'ic_document-filled' },
                { id: 2, label: 'recent > test2', icon: 'ic_document-filled' },
                { id: 3, label: 'recent > test3', icon: 'ic_favorite-filled' },
            ];
        } else {
            state.searchMenuMap = [];
        }
    }, 300, {
        leading: true,
    }));


    return {
        state,
        getters,
        ...actions,
    };
});
