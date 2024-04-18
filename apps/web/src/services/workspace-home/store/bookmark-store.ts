import { computed, reactive } from 'vue';

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

import ErrorHandler from '@/common/composables/error/errorHandler';

import { fetchFavicon } from '@/services/workspace-home/composables/use-bookmark';
import type { BookmarkItem, BookmarkModalType, BookmarkModalStateType } from '@/services/workspace-home/types/workspace-home-type';

export const useBookmarkStore = defineStore('bookmark', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;

    const state = reactive({
        bookmarkFolderData: [] as BookmarkItem[],
        bookmarkData: [] as BookmarkItem[],
        filterByFolder: undefined as string|undefined,
        selectedBookmark: undefined as BookmarkItem|undefined,
        isFullMode: false,
        isFileFullMode: false,
        modal: {
            isNew: undefined as boolean|undefined,
            isEdit: undefined as boolean|undefined,
            type: undefined as BookmarkModalType|undefined,
        } as BookmarkModalStateType,
    });

    const _getters = reactive({
        userId: computed<string>(() => store.state.user.userId),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    });
    const getters = reactive({
        bookmarkFolderList: computed<BookmarkItem[]>(() => state.bookmarkFolderData),
        bookmarkList: computed<BookmarkItem[]>(() => {
            let filteredList: BookmarkItem[] = [];
            if (state.filterByFolder) {
                filteredList = state.bookmarkData.filter((i) => {
                    const bookmarkFolder = state.bookmarkFolderData.find((folder) => folder.name === state.filterByFolder);
                    return i.folder === bookmarkFolder?.id;
                });
            } else {
                filteredList = state.bookmarkData.filter((i) => !i.folder);
            }
            return state.isFullMode ? filteredList : filteredList.slice(0, 13);
        }),
        filterByFolder: computed<string|undefined>(() => state.filterByFolder),
        selectedBookmark: computed<BookmarkItem|undefined>(() => state.selectedBookmark),
        isFullMode: computed<boolean>(() => state.isFullMode),
        isFileFullMode: computed<boolean>(() => state.isFileFullMode),
        modal: computed<BookmarkModalStateType>(() => state.modal),
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
    };


    const actions = {
        fetchBookmarkFolderList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('updated_at', true)
                .setFilters([
                    { k: 'user_id', v: _getters.userId, o: '=' },
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                    { k: 'data.link', v: null, o: '=' },
                ]);
            try {
                if (!state.isFullMode) {
                    bookmarkListApiQuery.setPageLimit(10);
                }
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });
                state.bookmarkFolderData = (results ?? []).map((i) => ({
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
                .setSort('updated_at', true)
                .setFilters([
                    { k: 'user_id', v: _getters.userId, o: '=' },
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                    { k: 'data.link', v: null, o: '!=' },
                ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: bookmarkListApiQuery.data,
                });
                const promises: Promise<BookmarkItem>[] = (results ?? []).map(async (item) => {
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
        createBookmarkFolder: async (name: string) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: `console:bookmark:${name}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                    },
                });
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
                throw e;
            }
        },
        createBookmarkLink: async ({ name, link, folder }: { name: string, link: string, folder?: string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: `console:bookmark:${folder}:${name}`,
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
                state.bookmarkData = [];
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
                        name: item.name || '',
                        link: item.link || '',
                        folder: item.folder,
                    });
                }));
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
                throw e;
            }
        },
        updateBookmarkLink: async ({
            id, name, link, folder,
        }: { id: string, name: string, link: string, folder?: string}) => {
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
                state.bookmarkData = [];
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
                state.bookmarkData = [];
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
                state.bookmarkData = [];
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
