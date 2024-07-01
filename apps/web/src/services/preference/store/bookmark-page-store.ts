import { computed, reactive } from 'vue';

import { sortBy } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PublicConfigListParameters } from '@/schema/config/public-config/api-verbs/list';
import type { PublicConfigModel } from '@/schema/config/public-config/model';

import { fetchFavicon } from '@/common/components/bookmark/composables/use-bookmark';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

export const useBookmarkPageStore = defineStore('page-bookmark', () => {
    const state = reactive({
        loading: false,
        bookmarkFolderList: [] as BookmarkItem[],
        bookmarkList: [] as BookmarkItem[],
        bookmarkTotalCount: 0,
        pageStart: 0,
        pageLimit: 15,
        searchFilter: [] as ConsoleFilter[],
        selectedIndices: [] as number[],
    });

    const getters = reactive({
        bookmarkList: computed<BookmarkItem[]>(() => {
            const globalBookmark = state.bookmarkList.filter((i) => i.isGlobal);
            const sortedGlobalBookmark = sortBy(globalBookmark, (i) => !i.link).reverse();
            const workspaceBookmark = state.bookmarkList.filter((i) => !i.isGlobal);
            const sortedWorkspaceBookmark = sortBy(workspaceBookmark, (i) => !i.link).reverse();
            const combinedBookmarkList = [...sortedGlobalBookmark, ...sortedWorkspaceBookmark];
            return combinedBookmarkList.slice(state.pageStart, state.pageStart + state.pageLimit);
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
    };
    const actions = {
        resetState: () => {
            state.bookmarkFolderList = [];
            state.bookmarkList = [];
            state.pageStart = 0;
            state.pageLimit = 15;
            state.searchFilter = [] as ConsoleFilter[];
            state.selectedIndices = [] as number[];
        },
        fetchBookmarkFolderList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('updated_at', true)
                .setFilters([
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.link', v: null, o: '=' },
                ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.publicConfig.list<PublicConfigListParameters, ListResponse<PublicConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });
                state.bookmarkFolderList = (results ?? []).map((i) => ({
                    ...i.data,
                    workspace_id: i.data.workspaceId,
                    id: i.name,
                } as BookmarkItem));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkFolderList = [];
            }
        },
        fetchBookmarkList: async () => {
            const BookmarkListApiQueryHelper = new ApiQueryHelper()
                .setSort('updated_at', true)
                .setFilters([
                    ...state.searchFilter,
                    { k: 'name', v: 'console:bookmark:', o: '' },
                ]);
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.config.publicConfig.list<PublicConfigListParameters, ListResponse<PublicConfigModel>>({
                    query: BookmarkListApiQueryHelper.data,
                });

                const promises: Promise<BookmarkItem>[] = (results ?? []).map(async (item) => {
                    if (!item.data.link) {
                        return {
                            ...item.data as BookmarkItem,
                            id: item.name,
                            workspace_id: item.data.workspaceId,
                        };
                    }
                    const imgIcon = item.data.imgIcon || await fetchFavicon(item.data.link);
                    return {
                        ...item.data as BookmarkItem,
                        id: item.name,
                        workspace_id: item.data.workspaceId,
                        imgIcon: imgIcon || undefined,
                    };
                });
                state.bookmarkList = await Promise.all(promises);
                state.bookmarkTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkList = [];
            } finally {
                state.loading = false;
            }
        },
    };

    return {
        state,
        getters,
        ...mutation,
        ...actions,
    };
});
