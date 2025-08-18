import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { useBookmarkFolderListQuery } from '@/services/advanced/composables/use-bookmark-folder-list-query';
import { BOOKMARK_TYPE } from '@/services/advanced/constants/bookmark-constant';

interface BookmarkPageState {
    params?: Record<string, string>;
    selectedType: string;
    pageStart: number;
    pageLimit: number;
    searchFilter: ConsoleFilter[];
    selectedIndices: number[];
    isTableItem: boolean;
}

export const useBookmarkPageStore = defineStore('page-bookmark', () => {
    const { bookmarkFolderListData } = useBookmarkFolderListQuery();
    const state = reactive<BookmarkPageState>({
        params: undefined,
        selectedType: 'All',
        pageStart: 0,
        pageLimit: 30,
        searchFilter: [],
        selectedIndices: [],
        isTableItem: false,
    });

    const getters = reactive({
        bookmarkFilters: computed(() => {
            const filters: ConsoleFilter[] = [
                ...state.searchFilter,
                { k: 'name', v: 'console:bookmark:', o: '' },
            ];
            if (state.params?.group) {
                if (state.params.group === 'global') {
                    filters.push({ k: 'data.isGlobal', v: true, o: '=' });
                } else {
                    filters.push({ k: 'data.workspaceId', v: state.params.group, o: '=' });
                }
            }
            if (state.params?.folder) {
                const folderId = bookmarkFolderListData.value.find((i) => i.name === state.params?.folder)?.id;
                if (folderId) filters.push({ k: 'data.folder', v: folderId, o: '=' });
            }
            if (state.selectedType === BOOKMARK_TYPE.LINK) {
                filters.push({ k: 'data.link', v: null, o: '!=' });
            } else if (state.selectedType === BOOKMARK_TYPE.FOLDER) {
                filters.push({ k: 'data.link', v: null, o: '=' });
            }
            return filters;
        }),
    });

    const mutation = {
        setBookmarkListPageStart: (pageStart: number) => {
            state.pageStart = pageStart;
        },
        setBookmarkListPageLimit: (pageLimit: number) => {
            state.pageLimit = pageLimit;
        },
        setBookmarkListSearchFilters: (filters: ConsoleFilter[]) => {
            state.searchFilter = filters;
        },
        setSelectedBookmarkIndices: (indices: number[]) => {
            state.selectedIndices = indices;
        },
        setParams: (params?: Record<string, string>) => {
            state.params = params;
        },
        setSelectedType: (type: string) => {
            state.selectedType = type;
        },
        setIsTableItem: (status: boolean) => {
            state.isTableItem = status;
        },
    };
    const actions = {
        resetState: () => {
            state.params = undefined;
            state.selectedType = 'All';
            state.pageStart = 0;
            state.pageLimit = 30;
            state.searchFilter = [];
            state.selectedIndices = [];
            state.isTableItem = false;
        },
    };

    return {
        state,
        getters,
        ...mutation,
        ...actions,
    };
});
