import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import getRandomId from '@/lib/random-id-generator';

import { fetchFavicon } from '@/common/components/bookmark/composables/use-bookmark';
import { DEFAULT_BOOKMARK } from '@/common/components/bookmark/constant/constant';
import type { BookmarkItem, BookmarkModalStateType, BookmarkModalType } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

export const useBookmarkStore = defineStore('bookmark', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;

    const _getters = reactive({
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
        bookmarkType: BOOKMARK_TYPE.WORKSPACE as BookmarkType,
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
        setBookmarkType: (type: BookmarkType) => {
            state.bookmarkType = type;
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
            state.bookmarkType = BOOKMARK_TYPE.WORKSPACE;
        },
        fetchBookmarkFolderList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('created_at', false)
                .setFilters([
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                    { k: 'data.link', v: null, o: '=' },
                ]);
            try {
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.userConfig.list);
                } else if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.publicConfig.list);
                }
                const { status, response } = await fetcher({
                    query: bookmarkListApiQuery.data,
                });
                if (status === 'succeed') {
                    state.bookmarkFolderData = (response.results ?? []).map((i) => ({
                        ...i.data,
                        id: i.name,
                    } as BookmarkItem));
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkFolderData = [];
            }
        },
        fetchBookmarkList: async () => {
            const bookmarkListApiQuery = new ApiQueryHelper()
                .setSort('created_at', true)
                .setFilters([
                    { k: 'name', v: 'console:bookmark', o: '' },
                    { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                    { k: 'data.link', v: null, o: '!=' },
                ]);
            try {
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.userConfig.list);
                } else if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.publicConfig.list);
                }
                const { status, response } = await fetcher({
                    query: bookmarkListApiQuery.data,
                });
                if (status === 'succeed') {
                    if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE && isEmpty(response)) {
                        await actions.createDefaultBookmark();
                        return;
                    }
                    const promises: Promise<BookmarkItem>[] = (response.results ?? []).map(async (item) => {
                        const imgIcon = item.data.imgIcon || await fetchFavicon(item.data.link);
                        return {
                            ...item.data as BookmarkItem,
                            id: item.name,
                            imgIcon: imgIcon || undefined,
                        };
                    });

                    state.bookmarkData = await Promise.all(promises);
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.bookmarkData = [];
            }
        },
        createDefaultBookmark: async () => {
            try {
                await Promise.all(DefaultBookmarkData.map(async (item) => {
                    await actions.createBookmarkLink({
                        name: item.name as string || '',
                        link: item.link || '',
                        imgIcon: item.imgIcon,
                        type: BOOKMARK_TYPE.WORKSPACE,
                    });
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        createBookmarkFolder: async (name: string) => {
            try {
                let fetcher;
                let resource_group: undefined|string;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.set;
                    resource_group = undefined;
                } else if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.create;
                    resource_group = 'WORKSPACE';
                }
                await fetcher({
                    name: `console:bookmark:${name}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                    },
                    resource_group,
                });
                await actions.fetchBookmarkFolderList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        createBookmarkLink: async ({
            name, link, folder, imgIcon, type,
        }: { name?: string|TranslateResult, link?: string, folder?: string, imgIcon?: string, type?: BookmarkType}) => {
            try {
                let fetcher;
                let resource_group: undefined|string;
                if (type === BOOKMARK_TYPE.USER || state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.set;
                    resource_group = undefined;
                } else if (type === BOOKMARK_TYPE.WORKSPACE || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.create;
                    resource_group = 'WORKSPACE';
                }
                await fetcher({
                    name: `console:bookmark:${folder}:${name}-${getRandomId()}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        folder,
                        link,
                        imgIcon,
                    },
                    resource_group,
                });
                await actions.fetchBookmarkList();
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        updateBookmarkFolder: async ({ id, name }: { id?: string, name: string }) => {
            try {
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.update;
                } else if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.update;
                }
                await fetcher({
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
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.update;
                } else if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.update;
                }
                await fetcher({
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
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.delete;
                } else if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.delete;
                }
                await fetcher({
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
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.delete;
                } else if (state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.delete;
                }
                await fetcher({
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
