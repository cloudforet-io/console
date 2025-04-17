import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';

export const useDashboardTreeControlStore = defineStore('dashboard-tree-control', () => {
    const state = reactive({
        selectedPublicIdMap: {} as Record<string, boolean>,
        selectedPrivateIdMap: {} as Record<string, boolean>,
        newIdList: [] as string[],
        searchQueryTags: [] as QueryTag[],
    });

    /* Mutations */
    const setSelectedPublicIdMap = (idMap: Record<string, boolean>) => {
        state.selectedPublicIdMap = idMap;
    };
    const setSelectedPrivateIdMap = (idMap: Record<string, boolean>) => {
        state.selectedPrivateIdMap = idMap;
    };
    const setNewIdList = (newIdList: string[]) => {
        state.newIdList = newIdList;
    };
    const setSearchQueryTags = (queryTags: QueryTag[] = []) => {
        state.searchQueryTags = queryTags;
    };

    const mutations = {
        setSelectedPublicIdMap,
        setSelectedPrivateIdMap,
        setNewIdList,
        setSearchQueryTags,
    };

    /* Actions */
    const reset = () => {
        state.selectedPublicIdMap = {};
        state.selectedPrivateIdMap = {};
    };
    const resetSelectedIdMap = (type?: 'PUBLIC'|'PRIVATE') => {
        if (type === 'PUBLIC') {
            state.selectedPublicIdMap = {};
        } else if (type === 'PRIVATE') {
            state.selectedPrivateIdMap = {};
        } else {
            state.selectedPublicIdMap = {};
            state.selectedPrivateIdMap = {};
        }
    };

    const actions = {
        reset,
        resetSelectedIdMap,
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
