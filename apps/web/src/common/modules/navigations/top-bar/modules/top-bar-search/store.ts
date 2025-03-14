import { computed, reactive, watch } from 'vue';

import { debounce } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import type { ResourceSearchParameters, ResourceSearchResponse } from '@/schema/search/resource/api-verbs/search';
import type { ResourceModel } from '@/schema/search/resource/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { SEARCH_TAB } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import type { SearchTab, StageWorkspace } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import { tabResourceTypeMap } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import type { RecentItem } from '@/common/modules/navigations/type';
import { recentNSearchTabMap } from '@/common/modules/navigations/type';

interface TopBarSearchStoreState {
    loading: boolean;
    allWorkspacesChecked: boolean;
    isActivated: boolean;
    inputText: string;
    activeTab: SearchTab;
    recentMenuList: RecentItem[];
    searchMenuList: ResourceModel[];
    // workspace filter
    recentAccessedWorkspaces: string[];
    stagedWorkspaces: StageWorkspace[];
}

export const useTopBarSearchStore = defineStore('top-bar-search', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const workspaceStoreState = userWorkspaceStore.$state;
    const recentStore = useRecentStore();
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
        activeTab: 'service',
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
            state.activeTab = 'service';
            actions.initWorkspaces();
        },
        setSelectedWorkspaces: (selectedWorkspaces: string[]) => {
            state.stagedWorkspaces = state.stagedWorkspaces.map((workspace) => ({
                ...workspace,
                isSelected: selectedWorkspaces.includes(workspace.workspaceId),
            }));
        },
        addStagedWorkspace: (workspace: StageWorkspace) => {
            state.stagedWorkspaces.push(workspace);
            state.stagedWorkspaces = orderWorkspaceList(state.stagedWorkspaces);
        },
        removeStagedWorkspace: (workspace: StageWorkspace) => {
            state.stagedWorkspaces = state.stagedWorkspaces.filter((stagedWorkspace) => stagedWorkspace.workspaceId !== workspace.workspaceId);
        },
        fetchSearchList: async (searchText: string, activeTab: SearchTab, workspaces:string[]) => {
            try {
                const { results } = await SpaceConnector.clientV2.search.resource.search<ResourceSearchParameters, ResourceSearchResponse>({
                    resource_type: tabResourceTypeMap[activeTab],
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
            }
        },

    };
    watch([() => getters.trimmedInputText, () => state.activeTab], (trimmedText) => {
        state.loading = true;
        state.recentMenuList = [];
        if (trimmedText) {
            state.searchMenuList = [];
        }
    });

    watch([
        () => getters.trimmedInputText,
        () => getters.selectedWorkspaces,
        () => state.activeTab,
        () => state.isActivated,
        () => state.allWorkspacesChecked,
    ], debounce(async ([trimmedText, workspaces, tab]) => {
        state.loading = true;
        state.recentMenuList = [];
        if (!trimmedText && storeState.currentWorkspaceId) {
            const recentRes = await recentStore.fetchRecent({
                type: recentNSearchTabMap[tab],
                workspaceIds: [storeState.currentWorkspaceId],
            });
            if (tab !== SEARCH_TAB.SERVICE) state.recentMenuList = recentRes;
            state.loading = false;
            return;
        }

        state.searchMenuList = [];
        const isServiceTab = tab === SEARCH_TAB.SERVICE;
        const isSpecificWorkspaceCase = getters.selectedWorkspaces && !state.allWorkspacesChecked;
        if (!isServiceTab && getters.trimmedInputText && (isSpecificWorkspaceCase || state.allWorkspacesChecked)) {
            await actions.fetchSearchList(trimmedText, tab, workspaces);
        } else {
            state.searchMenuList = [];
        }
        state.loading = false;
    }, 500));

    watch(() => recentStore.state.totalCount, () => {
        state.recentMenuList = recentStore.state.recentMenuList;
    });


    return {
        storeState,
        state,
        getters,
        ...actions,
    };
});
