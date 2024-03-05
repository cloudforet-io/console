import { computed, reactive, watch } from 'vue';

import { debounce } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import type { ResourceSearchParameters, ResourceSearchResponse } from '@/schema/search/resource/api-verbs/search';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

export interface StageWorkspace {workspaceId: string, label: string, theme?:string, isSelected: boolean}

export const tabResourceTypeMap = {
    serviceAccount: 'identity.ServiceAccount',
    project: 'identity.Project',
    dashboard: 'dashboard.PublicDashboard',
    cloudService: 'inventory.CloudServiceType',
};
export type SearchTab = keyof typeof tabResourceTypeMap | 'service';

interface TopBarSearchStoreState {
    loading: boolean;
    allWorkspacesChecked: boolean;
    isActivated: boolean;
    inputText: string;
    activateTab: SearchTab;
    recentMenuList: any[]; // TODO: check type
    searchMenuList: any; // TODO: check type
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
        return workspaceList.sort((a, b) => {
            if (a.value === storeState.currentWorkspaceId) return -1;
            if (b.value === storeState.currentWorkspaceId) return 1;
            return 0;
        });
    };

    const storeState = reactive({
        currentWorkspaceId: computed(() => workspaceStoreState.getters.currentWorkspaceId),
        workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
        workspaceMap: computed(() => allReferenceGetters.workspace),
    });
    const state = reactive<TopBarSearchStoreState>({
        loading: false,
        allWorkspacesChecked: false,
        isActivated: false,
        inputText: '',
        activateTab: 'service',
        recentMenuList: [],
        searchMenuList: [],
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
        selectedWorkspaces: computed<string[]>(() => state.stagedWorkspaces.filter((workspace) => workspace.isSelected).map((workspace) => workspace.workspaceId)),
    });

    const actions = {
        setIsActivated: (isActivated: boolean, options?:{
            initSearch?: boolean,
        }) => {
            const { initSearch = true } = options || {};
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
                workspaceId: workspace.value,
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
                isSelected: selectedWorkspaces.includes(workspace.workspaceId),
            }));
        },
        addStagedWorkspace: (workspace: StageWorkspace) => {
            if (state.stagedWorkspaces.length >= 5) return;
            state.stagedWorkspaces.push(workspace);
            state.stagedWorkspaces = orderWorkspaceList(state.stagedWorkspaces);
        },
        removeStagedWorkspace: (workspace: StageWorkspace) => {
            state.stagedWorkspaces = state.stagedWorkspaces.filter((stagedWorkspace) => stagedWorkspace.workspaceId !== workspace.workspaceId);
        },
        fetchSearchList: async (searchText: string, activateTab: SearchTab, workspaces) => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.clientV2.search.resource.search<ResourceSearchParameters, ResourceSearchResponse>({
                    resource_type: tabResourceTypeMap[activateTab],
                    keyword: searchText,
                    workspaces,
                    limit: 15,
                    all_workspaces: state.allWorkspacesChecked,
                });
                let orderedResults = results;
                if (storeState.currentWorkspaceId !== undefined) {
                    orderedResults = results?.sort((a, b) => {
                        if (a.workspace_id === storeState.currentWorkspaceId) return -1;
                        if (b.workspace_id === storeState.currentWorkspaceId) return 1;
                        return 0;
                    });
                }

                state.searchMenuList = orderedResults ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        },

    };

    watch([
        () => getters.trimmedInputText,
        () => state.activateTab,
        () => getters.selectedWorkspaces,
        () => state.isActivated,
    ], debounce(async ([trimmedText, activateTab, workspaces, active]) => {
        if (trimmedText) {
            await actions.fetchSearchList(trimmedText, activateTab, workspaces);
            // state.recentMenuList = fetchRecentList(trimmedText);
        } else {
            state.searchMenuList = [];
        }
    }, 500));


    return {
        storeState,
        state,
        getters,
        ...actions,
    };
});
