import { computed, reactive } from 'vue';

import {
    at, filter, forEach, indexOf, sortBy,
} from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { SharedConfigListParameters } from '@/api-clients/config/shared-config/schema/api-verbs/list';
import type { SharedConfigModel } from '@/api-clients/config/shared-config/schema/model';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { fetchFavicon } from '@/common/components/bookmark/composables/use-bookmark';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/advanced/constants/bookmark-constant';

interface BookmarkPageState {
    workspaceList: WorkspaceModel[];
    loading: boolean;
    bookmarkFolderList: BookmarkItem[];
    bookmarkList: BookmarkItem[];
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
            const sortedGlobalBookmark = sortBy(globalBookmark, [(i) => !i.link, (i) => i.updatedAt]).reverse();

            const workspaceBookmark = state.bookmarkList.filter((i) => !i.isGlobal);
            const sortedWorkspaceBookmark = sortBy(workspaceBookmark, [(i) => !i.link, (i) => i.updatedAt]).reverse();
            const combinedBookmark = [...sortedGlobalBookmark, ...sortedWorkspaceBookmark];
            return (!state.params?.folder && state.searchFilter.length === 0) ? combinedBookmark.filter((i) => !i.folder) : combinedBookmark;
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
                const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
                    query: {
                        filter: [{ k: 'state', v: 'ENABLED', o: 'eq' }],
                    },
                });
                state.workspaceList = sortBy((results ?? []), (i) => i.name.toLowerCase());
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
                const { results } = await SpaceConnector.clientV2.config.sharedConfig.list<SharedConfigListParameters, ListResponse<SharedConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });

                const list = (results ?? []).map((i) => ({
                    ...i.data,
                    workspaceId: i.data.workspaceId,
                    id: i.name,
                    updatedAt: i.updated_at,
                } as BookmarkItem));

                const enabledWorkspaceBookmark: BookmarkItem[] = [];
                forEach(list, (item) => {
                    const workspace = state.workspaceList.find((w) => w.workspace_id === item.workspaceId);
                    if (workspace?.state === 'ENABLED') {
                        enabledWorkspaceBookmark.push(item);
                    } else if (item.isGlobal) {
                        enabledWorkspaceBookmark.push(item);
                    }
                });

                state.bookmarkFolderList = enabledWorkspaceBookmark;
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
                const { results } = await SpaceConnector.clientV2.config.sharedConfig.list<SharedConfigListParameters, ListResponse<SharedConfigModel>>({
                    query: BookmarkListApiQueryHelper.data,
                });

                const promises: Promise<BookmarkItem>[] = (results ?? []).map(async (item) => {
                    if (!item.data.link) {
                        return {
                            ...item.data as BookmarkItem,
                            id: item.name,
                            workspaceId: item.data.workspaceId,
                            updatedAt: item.updated_at,
                        };
                    }
                    const imgIcon = item.data.imgIcon || await fetchFavicon(item.data.link);
                    return {
                        ...item.data as BookmarkItem,
                        id: item.name,
                        workspaceId: item.data.workspaceId,
                        imgIcon: imgIcon || undefined,
                        updatedAt: item.updated_at,
                    };
                });
                const list = await Promise.all(promises);

                const enabledWorkspaceBookmark: BookmarkItem[] = [];
                forEach(list, (item) => {
                    const workspace = state.workspaceList.find((w) => w.workspace_id === item.workspaceId);
                    if (workspace?.state === 'ENABLED') {
                        enabledWorkspaceBookmark.push(item);
                    } else if (item.isGlobal) {
                        enabledWorkspaceBookmark.push(item);
                    }
                });
                state.bookmarkList = enabledWorkspaceBookmark;
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
