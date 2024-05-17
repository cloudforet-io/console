import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigDeleteParameters } from '@/schema/config/user-config/api-verbs/delete';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigSetParameters } from '@/schema/config/user-config/api-verbs/set';
import type { UserConfigUpdateParameters } from '@/schema/config/user-config/api-verbs/update';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { fetchFavicon } from '@/services/workspace-home/composables/use-bookmark';
import { DEFAULT_BOOKMARK } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkItem, BookmarkModalType, BookmarkModalStateType } from '@/services/workspace-home/types/workspace-home-type';

export const useBookmarkStore = defineStore('bookmark', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;

    const _getters = reactive({
        isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
        userId: computed<string>(() => store.state.user.userId),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    });

    const DefaultBookmarkData = DEFAULT_BOOKMARK.map((i) => ({
        ...i,
        workspaceId: _getters.currentWorkspaceId,
    }));

    const state = reactive({
        bookmarkFolderData: [] as BookmarkItem[],
        bookmarkData: [] as BookmarkItem[],
        filterByFolder: undefined as string|undefined|TranslateResult,
        selectedBookmark: undefined as BookmarkItem|undefined,
        selectedBookmarks: [] as BookmarkItem[],
        isFullMode: false,
        isFileFullMode: false,
        modal: {
            isNew: undefined as boolean|undefined,
            isEdit: undefined as boolean|undefined,
            type: undefined as BookmarkModalType|undefined,
        } as BookmarkModalStateType,
    });

    const getters = reactive({
        bookmarkList: computed<BookmarkItem[]>(() => {
            let filteredList: BookmarkItem[] = [];
            if (state.filterByFolder) {
                filteredList = state.bookmarkData.filter((i) => {
                    const bookmarkFolder = state.bookmarkFolderData.find((folder) => folder.name === state.filterByFolder);
                    return i.folder === bookmarkFolder?.id;
                });
            } else {
                filteredList = state.bookmarkData.filter((i) => !i.folder);
                filteredList.unshift(...DefaultBookmarkData);
            }
            return filteredList;
        }),
    });

    const mutations = {
        setModalType: (type?: BookmarkModalType, isEditModal?: boolean, isNewFormModal?: boolean) => {
            state.modal.type = type;
            state.modal.isEdit = isEditModal;
            state.modal.isNew = isNewFormModal;
        },
        setFullMode: (isFullMode: boolean) => {
            state.isFullMode = isFullMode;
            state.isFileFullMode = false;
            state.filterByFolder = undefined;
            actions.fetchBookmarkList();
        },
        setFileFullMode: (isFullMode: boolean, item?: BookmarkItem) => {
            state.isFileFullMode = isFullMode;
            if (isFullMode && item) {
                state.filterByFolder = item?.name;
                state.selectedBookmark = item;
            } else {
                state.filterByFolder = undefined;
                state.selectedBookmark = undefined;
            }
            actions.fetchBookmarkList();
        },
        setSelectedBookmark: (bookmark?: BookmarkItem, isBoard?: boolean) => {
            if (!isBoard) {
                state.filterByFolder = bookmark?.name;
            }
            state.selectedBookmark = bookmark;
        },
        setSelectedBookmarks: (items: BookmarkItem[]) => {
            state.selectedBookmarks = items;
        },
        deleteSelectedId: (idx: number) => {
            state.selectedBookmarks.splice(idx, 1);
        },
    };


    const actions = {
        resetState: () => {
            state.bookmarkFolderData = [];
            state.filterByFolder = undefined;
            state.selectedBookmark = undefined;
            state.isFullMode = false;
            state.isFileFullMode = false;
            state.modal = {
                isNew: undefined,
                isEdit: undefined,
                type: undefined,
            };
            state.selectedBookmarks = [];
        },
        fetchBookmarkFolderList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('created_at', false)
                .setFilters([
                    { k: 'user_id', v: _getters.userId, o: '=' },
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.link', v: null, o: '=' },
                ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });
                const managedResults = _getters.isDomainAdmin ? results?.filter((i) => i.data.isManaged) : [];
                const workspaceResults = results?.filter((i) => !i.data.isManaged && i.data.workspaceId === _getters.currentWorkspaceId);
                const resultsData = managedResults?.concat(workspaceResults || []) || [];
                state.bookmarkFolderData = resultsData.map((i) => ({
                    ...i.data,
                    id: i.name,
                } as BookmarkItem));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkFolderData = [];
            }
        },
        fetchBookmarkList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('created_at', true)
                .setFilters([
                    { k: 'user_id', v: _getters.userId, o: '=' },
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.link', v: null, o: '!=' },
                ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });
                const managedResults = _getters.isDomainAdmin ? results?.filter((i) => i.data.isManaged) : [];
                const workspaceResults = _getters.isDomainAdmin ? results?.filter((i) => !i.data.isManaged && i.data.workspaceId === _getters.currentWorkspaceId) : [];
                const resultsData = managedResults?.concat(workspaceResults || []) || [];
                const promises: Promise<BookmarkItem>[] = resultsData.map(async (item) => {
                    const imgIcon = await fetchFavicon(item.data.link);
                    return {
                        ...item.data as BookmarkItem,
                        id: item.name,
                        imgIcon: imgIcon || undefined,
                    };
                });

                state.bookmarkData = await Promise.all(promises);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
            }
        },
        createBookmarkFolder: async (name: string, isManaged?: boolean) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: `console:bookmark:${name}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        isManaged,
                    },
                });
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        createBookmarkLink: async ({
            name, link, folder, isManaged,
        }: { name?: string|TranslateResult, link?: string, folder?: string, isManaged?: boolean}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: `console:bookmark:${folder}:${name}-${getRandomId()}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        isManaged,
                        folder,
                        link,
                    },
                });
                await actions.fetchBookmarkList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        updateBookmarkFolder: async ({ id, name }: { id?: string, name: string }) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.update<UserConfigUpdateParameters, UserConfigModel>({
                    name: id || '',
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                    },
                });
                const foldersLinkItems = state.bookmarkData.filter((i) => i.folder === id);
                await Promise.all(foldersLinkItems.map(async (item) => {
                    await actions.updateBookmarkLink({
                        id: item.id || '',
                        name: item.name as string || '',
                        link: item.link || '',
                        folder: item.folder,
                    });
                }));
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        updateBookmarkLink: async ({
            id, name, link, folder,
        }: { id: string, name?: string|TranslateResult, link?: string, folder?: string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.update<UserConfigUpdateParameters, UserConfigModel>({
                    name: id,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        folder,
                        link,
                    },
                });
                await actions.fetchBookmarkList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        deleteBookmarkFolder: async (id?: string) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.delete<UserConfigDeleteParameters, UserConfigModel>({
                    name: id || '',
                });
                const foldersLinkItems = state.bookmarkData.filter((i) => i.folder === id);
                await Promise.all(foldersLinkItems.map(async (item) => {
                    await actions.deleteBookmarkLink(item.id || '');
                }));
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        deleteBookmarkLink: async (id?: string) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.delete<UserConfigDeleteParameters, UserConfigModel>({
                    name: id || '',
                });
                await actions.fetchBookmarkList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
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
