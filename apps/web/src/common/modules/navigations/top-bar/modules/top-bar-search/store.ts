import { computed, reactive, watch } from 'vue';

import { debounce } from 'lodash';
import { defineStore } from 'pinia';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

export interface StageWorkspace {name: string, label: string, theme?:string, isSelected: boolean}
interface TopBarSearchStoreState {
    isActivated: boolean;
    inputText: string;
    activateTab: string;
    recentMenuList: any[]; // TODO: check type
    searchMenuMap: any; // TODO: check type
    // workspace filter
    recentAccessedWorkspaces: string[];
    stagedWorkspaces: StageWorkspace[];
}

export const useTopBarSearchStore = defineStore('top-bar-search', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const workspaceStoreState = userWorkspaceStore.$state;
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;

    const orderWorkspaceList = (workspaceList: any[]) => {
        if (!storeState.currentWorkspaceId) return workspaceList;
        const orderedWorkspaceList = workspaceList.sort((a, b) => {
            if (a.value === storeState.currentWorkspaceId) return -1;
            if (b.value === storeState.currentWorkspaceId) return 1;
            return 0;
        });
        return orderedWorkspaceList;
    };

    const storeState = reactive({
        currentWorkspaceId: computed(() => workspaceStoreState.getters.currentWorkspaceId),
        workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
        workspaceMap: computed(() => allReferenceGetters.workspace),
    });

    const state = reactive<TopBarSearchStoreState>({
        isActivated: false,
        inputText: '',
        activateTab: 'service',
        recentMenuList: [],
        searchMenuMap: {},
        // workspace filter
        recentAccessedWorkspaces: [],
        stagedWorkspaces: [],
    });

    const getters = reactive({
        isActivated: computed<boolean>(() => state.isActivated),
        inputText: computed<string>(() => state.inputText),
        trimmedInputText: computed<string>(() => {
            if (state.inputText) return state.inputText.trim();
            return '';
        }),
        isRecentEmpty: computed<boolean>(() => state.recentMenuList.length === 0),
        selectedWorkspaces: computed<string[]>(() => state.stagedWorkspaces.filter((workspace) => workspace.isSelected).map((workspace) => workspace.name)),
    });

    const actions = {
        setIsActivated: (isActivated: boolean, initSearch = true) => {
            state.isActivated = isActivated;
            if (initSearch) {
                actions.initSearch();
            }
        },
        initWorkspaces: () => {
            const workspaceList = storeState.workspaceList.map((workspace) => ({
                label: workspace.name,
                value: workspace.workspace_id,
                tags: workspace.tags,
            } as { label: string, value: string, tags: { theme: string } | undefined }));
            // 현재 워크스페이스를 가장 상단에 위치시키기 위해 정렬
            const orderedWorkspaceList = orderWorkspaceList(workspaceList);
            state.stagedWorkspaces = orderedWorkspaceList.slice(0, 3).map((workspace) => ({
                name: workspace.value,
                label: workspace.label,
                theme: workspace.tags?.theme,
                isSelected: workspace.value === storeState.currentWorkspaceId,
            }));
        },
        initSearch: () => {
            state.inputText = '';
            state.activateTab = 'service';
            actions.initWorkspaces();
        },
        setSelectedWorkspaces: (selectedWorkspaces: string[]) => {
            state.stagedWorkspaces = state.stagedWorkspaces.map((workspace) => ({
                ...workspace,
                isSelected: selectedWorkspaces.includes(workspace.name),
            }));
        },
        addStagedWorkspace: (workspace: StageWorkspace) => {
            if (state.stagedWorkspaces.length >= 5) return;
            state.stagedWorkspaces.push(workspace);
            state.stagedWorkspaces = orderWorkspaceList(state.stagedWorkspaces);
        },
        removeStagedWorkspace: (workspace: StageWorkspace) => {
            state.stagedWorkspaces = state.stagedWorkspaces.filter((stagedWorkspace) => stagedWorkspace.name !== workspace.name);
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
        storeState,
        state,
        getters,
        ...actions,
    };
});
