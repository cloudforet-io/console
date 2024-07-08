import { computed, reactive } from 'vue';

import {
    at, filter, indexOf, sortBy,
} from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PublicConfigListParameters } from '@/schema/config/public-config/api-verbs/list';
import type { PublicConfigModel } from '@/schema/config/public-config/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { fetchFavicon } from '@/common/components/bookmark/composables/use-bookmark';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/preference/constants/bookmark-constant';

interface BookmarkPageState {
    workspaceList: WorkspaceModel[];
    loading: boolean;
    bookmarkFolderList: BookmarkItem[];
    bookmarkList: BookmarkItem[];
    bookmarkTotalCount: number;
    pageStart: number;
    pageLimit: number;
    searchFilter: ConsoleFilter[];
    selectedIndices: number[];
    params?: Record<string, string>;
    selectedType: string;
    isTableItem: boolean;
}

export const useBookmarkPageStore = defineStore('page-bookmark', () => {
    const state = reactive<BookmarkPageState>({
        workspaceList: [],
        loading: false,
        bookmarkFolderList: [],
        bookmarkList: [],
        bookmarkTotalCount: 0,
        pageStart: 0,
        pageLimit: 30,
        searchFilter: [],
        selectedIndices: [],
        params: undefined,
        selectedType: 'All',
        isTableItem: false,
    });

    const getters = reactive({
        entireBookmarkList: computed<BookmarkItem[]>(() => {
            const globalBookmark = state.bookmarkList.filter((i) => i.isGlobal);
            const sortedGlobalBookmark = sortBy(globalBookmark, (i) => !i.link).reverse();
            const workspaceBookmark = state.bookmarkList.filter((i) => !i.isGlobal);
            const sortedWorkspaceBookmark = sortBy(workspaceBookmark, (i) => !i.link).reverse();
            return [...sortedGlobalBookmark, ...sortedWorkspaceBookmark];
        }),
        bookmarkList: computed<BookmarkItem[]>(() => getters.entireBookmarkList.slice(state.pageStart, state.pageStart + state.pageLimit)),
        selectedIndices: computed<number[]>(() => {
            const selectedItems = at(getters.bookmarkList, state.selectedIndices);
            const activeItems = filter(selectedItems, (i) => i.isGlobal);
            const activeItemIndices: number[] = [];
            activeItems.forEach((item) => {
                const index = indexOf(getters.bookmarkList, item);
                if (index !== -1) activeItemIndices.push(index);
            });
            return activeItemIndices;
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
            state.workspaceList = [];
            state.loading = false;
            state.bookmarkTotalCount = 0;
            state.params = undefined;
            state.selectedType = 'All';
            state.bookmarkFolderList = [];
            state.bookmarkList = [];
            state.pageStart = 0;
            state.pageLimit = 30;
            state.searchFilter = [];
            state.selectedIndices = [];
        },
        fetchWorkspaceList: async () => {
            try {
                const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>();
                state.workspaceList = results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.workspaceList = [];
            }
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
        fetchBookmarkList: async (selectedType?: string) => {
            const defaultFilters: ConsoleFilter[] = [
                ...state.searchFilter,
                { k: 'name', v: 'console:bookmark:', o: '' },
            ];
            if (state.params) {
                if (state.params.group) {
                    if (state.params.group === 'global') {
                        defaultFilters.push({ k: 'data.isGlobal', v: true, o: '=' });
                    } else {
                        defaultFilters.push({ k: 'data.workspaceId', v: state.params.group, o: '=' });
                    }
                }
                if (state.params.folder) {
                    const folderId = state.bookmarkFolderList.find((i) => i.name === state.params?.folder)?.id;
                    if (folderId) defaultFilters.push({ k: 'data.folder', v: folderId, o: '=' });
                }
            }
            if (selectedType === BOOKMARK_TYPE.LINK) {
                defaultFilters.push({ k: 'data.link', v: null, o: '!=' });
            } else if (selectedType === BOOKMARK_TYPE.FOLDER) {
                defaultFilters.push({ k: 'data.link', v: null, o: '=' });
            }
            const BookmarkListApiQueryHelper = new ApiQueryHelper()
                .setSort('updated_at', true)
                .setFilters(defaultFilters);
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
