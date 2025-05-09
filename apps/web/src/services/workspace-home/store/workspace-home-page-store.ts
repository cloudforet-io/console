import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { sortBy } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import type { AppListParameters } from '@/api-clients/identity/app/schema/api-verbs/list';
import type { AppModel } from '@/api-clients/identity/app/schema/model';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { MENU_ID } from '@/lib/menu/config';

import { fetchFavicon } from '@/common/components/bookmark/composables/use-bookmark';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type {
    BookmarkType,
} from '@/services/workspace-home/types/workspace-home-type';


interface WorkspaceHomeState {
    // info
    workspaceUserTotalCount: number|undefined;
    appsTotalCount: number|undefined;
    // bookmark
    bookmarkFolderData: BookmarkItem[];
    bookmarkData: BookmarkItem[];
    isFullMode: boolean;
    isFileFullMode: boolean;
    // user config
    recentList: UserConfigModel[];
    favoriteMenuList: FavoriteItem[];
}

export const useWorkspaceHomePageStore = defineStore('page-workspace-home', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;
    const bookmarkStore = useBookmarkStore();
    const bookmarkState = bookmarkStore.state;
    const userStore = useUserStore();

    const state = reactive<WorkspaceHomeState>({
        workspaceUserTotalCount: undefined,
        appsTotalCount: undefined,

        bookmarkFolderData: [],
        bookmarkData: [],
        isFullMode: false,
        isFileFullMode: false,

        recentList: [],
        favoriteMenuList: [],

    });

    const _getters = reactive({
        userId: computed<string|undefined>(() => userStore.state.userId),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
        bookmarkType: computed<BookmarkType|undefined>(() => bookmarkState.bookmarkType),
        filterByFolder: computed<TranslateResult|undefined>(() => bookmarkState.filterByFolder),
    });

    const getters = reactive({
        bookmarkList: computed<BookmarkItem[]>(() => {
            let filteredList: BookmarkItem[] = [];
            if (_getters.filterByFolder) {
                filteredList = state.bookmarkData.filter((i) => {
                    const bookmarkFolder = state.bookmarkFolderData.find((folder) => folder.name === _getters.filterByFolder);
                    return i.folder === bookmarkFolder?.id;
                });
            } else {
                filteredList = state.bookmarkData.filter((i) => !i.folder);
            }
            return filteredList;
        }),
    });

    const mutations = {
        setFullMode: (isFullMode: boolean) => {
            state.isFullMode = isFullMode;
            state.isFileFullMode = false;
            actions.fetchBookmarkList();
            bookmarkStore.setFilterByFolder(undefined);
        },
        setFileFullMode: (isFullMode: boolean, item?: BookmarkItem) => {
            state.isFileFullMode = isFullMode;
            if (isFullMode && item) {
                bookmarkStore.setSelectedBookmark(item);
            } else {
                bookmarkStore.setSelectedBookmark(undefined);
            }
            actions.fetchBookmarkList();
        },
    };

    const recentListApiQuery = new ApiQueryHelper().setSort('updated_at', true);
    const favoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);
    const listCountQueryHelper = new ApiQueryHelper().setCountOnly();

    const actions = {
        resetState: () => {
            state.workspaceUserTotalCount = undefined;
            state.appsTotalCount = undefined;
            state.bookmarkFolderData = [];
            state.bookmarkData = [];
            state.isFullMode = false;
            state.isFileFullMode = false;
            state.recentList = [];
            state.favoriteMenuList = [];
        },
        fetchBookmarkFolderList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('updated_at', true)
                .setFilters([
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.link', v: null, o: '=' },
                ]);
            try {
                let fetcher;
                if (_getters.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.userConfig.list);
                    bookmarkListApiQuery.addFilter({ k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' });
                } else if (_getters.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.sharedConfig.list);
                    bookmarkListApiQuery.setOrFilters([
                        { k: 'workspace_id', v: '*', o: '=' },
                        { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                    ]);
                }

                const { status, response } = await fetcher({
                    query: bookmarkListApiQuery.data,
                });
                if (status === 'succeed') {
                    const list = (response.results ?? []).map((i) => ({
                        ...i.data,
                        id: i.name,
                    } as BookmarkItem));
                    state.bookmarkFolderData = sortBy(list, [(i) => !i.isGlobal]);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkFolderData = [];
            }
        },
        fetchBookmarkList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('updated_at', true)
                .setFilters([
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.link', v: null, o: '!=' },
                ]);
            try {
                let fetcher;
                if (_getters.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.userConfig.list);
                    bookmarkListApiQuery.addFilter({ k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' });
                } else if (_getters.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.sharedConfig.list);
                    bookmarkListApiQuery.setOrFilters([
                        { k: 'workspace_id', v: '*', o: '=' },
                        { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                    ]);
                }
                const { status, response } = await fetcher({
                    query: bookmarkListApiQuery.data,
                });
                if (status === 'succeed') {
                    const promises: Promise<BookmarkItem>[] = (response.results ?? []).map(async (item) => {
                        const imgIcon = item.data.imgIcon || await fetchFavicon(item.data.link);
                        return {
                            ...item.data as BookmarkItem,
                            id: item.name,
                            imgIcon: imgIcon || undefined,
                        };
                    });

                    const list = await Promise.all(promises);
                    state.bookmarkData = sortBy(list, [(i) => !i.isGlobal]);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
            }
        },
        fetchRecentList: async (currentWorkspaceId: string) => {
            recentListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId || '', o: '=' },
                { k: 'name', v: 'console:recent:', o: '' },
                { k: 'data.workspace_id', v: currentWorkspaceId, o: '=' },
                { k: 'data.type', v: RECENT_TYPE.WORKSPACE, o: '!=' },
                { k: 'data.id', v: MENU_ID.WORKSPACE_HOME, o: '!=' },
                // NOTE: Code corresponding to data stored as 'home-dashboard'
                { k: 'data.id', v: 'home-dashboard', o: '!=' },
            ]);

            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: recentListApiQuery.data,
                });
                state.recentList = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.recentList = [];
            }
        },
        fetchFavoriteList: async (selectedItem?: string) => {
            favoriteListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId || '', o: '=' },
                { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                { k: 'data.itemType', v: FAVORITE_TYPE.WORKSPACE, o: '!=' },
            ]);
            if (selectedItem === 'All' || !selectedItem) {
                favoriteListApiQuery.addFilter({ k: 'name', v: 'console:favorite:', o: '' });
            } else {
                favoriteListApiQuery.addFilter({ k: 'name', v: `console:favorite:${selectedItem}`, o: '' });
            }
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: favoriteListApiQuery.data,
                });
                const _recentList = (results ?? []).map((i) => i.data as FavoriteItem);
                state.favoriteMenuList = _recentList.filter((i) => !i?.isDeleted);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.favoriteMenuList = [];
            }
        },
        fetchWorkspaceUserList: async () => {
            try {
                const { total_count } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>({
                    workspace_id: _getters.currentWorkspaceId,
                    query: listCountQueryHelper.data,
                });
                state.workspaceUserTotalCount = total_count || undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        fetchAppList: async () => {
            try {
                const { total_count } = await SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>({
                    workspace_id: _getters.currentWorkspaceId,
                    query: listCountQueryHelper.data,
                });
                state.appsTotalCount = total_count || undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
