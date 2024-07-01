import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DomainConfigCreateParameters } from '@/schema/config/domain-config/api-verbs/create';
import type { DomainConfigModel } from '@/schema/config/domain-config/model';
import type { PublicConfigListParameters } from '@/schema/config/public-config/api-verbs/list';
import type { PublicConfigModel } from '@/schema/config/public-config/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import getRandomId from '@/lib/random-id-generator';

import { DEFAULT_BOOKMARK } from '@/common/components/bookmark/constant/constant';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

export const useBookmarkPageStore = defineStore('page-bookmark', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;

    const _getters = reactive({
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    });

    const state = reactive({
        bookmarkFolderList: [] as BookmarkItem[],
        bookmarkList: [] as BookmarkItem[],
        pageStart: 0,
        pageLimit: 15,
        searchFilter: [] as ConsoleFilter[],
        selectedIndices: [] as number[],
    });

    const getters = reactive({
        allBookmarkFolderItems: computed<BookmarkItem[]>(() => ([
            ...getters.publicBookmarkFolderData,
        ])),
        publicBookmarkFolderData: computed<BookmarkItem[]>(() => state.bookmarkList.filter((f) => !f.link) || []),
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
                .setPage(state.pageStart, state.pageLimit)
                .setSort('updated_at', true)
                .setFilters([
                    ...state.searchFilter,
                    { k: 'name', v: 'console:bookmark:', o: '' },
                ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.publicConfig.list<PublicConfigListParameters, ListResponse<PublicConfigModel>>({
                    query: BookmarkListApiQueryHelper.data,
                });
                state.bookmarkList = (results ?? []).map((i) => ({
                    ...i.data,
                    workspace_id: i.data.workspaceId,
                    id: i.name,
                } as BookmarkItem));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkList = [];
            }
        },
        createDefaultBookmark: async () => {
            const DefaultBookmarkData = DEFAULT_BOOKMARK.map((i) => ({
                ...i,
                workspaceId: _getters.currentWorkspaceId,
            }));
            try {
                await Promise.all(DefaultBookmarkData.map(async (item) => {
                    await actions.createGlobalBookmark({
                        name: item.name as string || '',
                        link: item.link || '',
                        imgIcon: item.imgIcon,
                    });
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        createGlobalBookmark: async ({
            name, link, folder, imgIcon,
        }: { name?: string|TranslateResult, link?: string, folder?: string, imgIcon?: string}) => {
            try {
                await SpaceConnector.clientV2.config.domainConfig.create<DomainConfigCreateParameters, DomainConfigModel>({
                    name: `console:bookmark:global:${name}-${getRandomId()}`,
                    data: {
                        name,
                        folder,
                        link,
                        imgIcon,
                    },
                });
                await actions.fetchPublicBookmarkList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
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
