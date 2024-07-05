import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import getRandomId from '@/lib/random-id-generator';

import type { BookmarkItem, BookmarkModalStateType, BookmarkModalType } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

interface BookmarkState {
    modal: BookmarkModalStateType;
    bookmarkType?: BookmarkType;
    selectedBookmark?: BookmarkItem;
    selectedBookmarks: BookmarkItem[];
    filterByFolder?: string|TranslateResult;
}

export const useBookmarkStore = defineStore('bookmark', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;
    const appContextStore = useAppContextStore();
    const appContextGetters = appContextStore.getters;

    const _getters = reactive({
        isAdminMode: computed(() => appContextGetters.isAdminMode),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    });

    const state = reactive<BookmarkState>({
        modal: {
            isNew: undefined,
            isEdit: undefined,
            type: undefined,
        },
        bookmarkType: BOOKMARK_TYPE.WORKSPACE,
        selectedBookmark: undefined,
        selectedBookmarks: [],
        filterByFolder: undefined,
    });

    const mutations = {
        setModalType: (type?: BookmarkModalType, isEditModal?: boolean, isNewFormModal?: boolean) => {
            state.modal.type = type;
            state.modal.isEdit = isEditModal;
            state.modal.isNew = isNewFormModal;
        },
        setBookmarkType: (type?: BookmarkType) => {
            state.bookmarkType = type;
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
        setFilterByFolder: (name?: TranslateResult) => {
            state.filterByFolder = name;
        },
        deleteSelectedId: (idx: number) => {
            state.selectedBookmarks.splice(idx, 1);
        },
    };

    const actions = {
        resetState: () => {
            state.modal = {
                isNew: undefined,
                isEdit: undefined,
                type: undefined,
            };
            state.bookmarkType = BOOKMARK_TYPE.WORKSPACE;
            state.selectedBookmark = undefined;
            state.selectedBookmarks = [];
        },
        createBookmarkFolder: async (name: string, type?: string) => {
            try {
                let fetcher;
                let resource_group: undefined|string;
                if (type === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.set;
                    resource_group = undefined;
                } else if (_getters.isAdminMode || type === BOOKMARK_TYPE.WORKSPACE || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.create;
                    resource_group = _getters.isAdminMode ? 'DOMAIN' : 'WORKSPACE';
                }
                await fetcher({
                    name: `console:bookmark:${name}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        isGlobal: _getters.isAdminMode,
                    },
                    resource_group,
                });
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
                if (type === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.set;
                    resource_group = undefined;
                } else if (_getters.isAdminMode || type === BOOKMARK_TYPE.WORKSPACE || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.create;
                    resource_group = _getters.isAdminMode ? 'DOMAIN' : 'WORKSPACE';
                }
                await fetcher({
                    name: `console:bookmark:${folder}:${name}-${getRandomId()}`,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        folder,
                        link,
                        imgIcon,
                        isGlobal: _getters.isAdminMode,
                    },
                    resource_group,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        updateBookmarkFolder: async ({
            id, name, bookmarkList,
        }: { id?: string, name: string, bookmarkList: BookmarkItem[] }) => {
            try {
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.update;
                } else if (_getters.isAdminMode || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.update;
                }
                await fetcher({
                    name: id || '',
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        isGlobal: _getters.isAdminMode,
                    },
                });
                const foldersLinkItems = bookmarkList.filter((i) => i.folder === id);
                await Promise.all(foldersLinkItems.map(async (item) => {
                    await actions.updateBookmarkLink({
                        id: item.id || '',
                        name: item.name as string || '',
                        link: item.link || '',
                        folder: item.folder,
                    });
                }));
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
                } else if (_getters.isAdminMode || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.update;
                }
                await fetcher({
                    name: id,
                    data: {
                        workspaceId: _getters.currentWorkspaceId,
                        name,
                        folder,
                        link,
                        isGlobal: _getters.isAdminMode,
                    },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        deleteBookmarkFolder: async ({
            id, bookmarkList,
        }: { id?: string, bookmarkList: BookmarkItem[] }) => {
            try {
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.delete;
                } else if (_getters.isAdminMode || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.delete;
                }
                await fetcher({
                    name: id || '',
                });
                const foldersLinkItems = bookmarkList.filter((i) => i.folder === id);
                await Promise.all(foldersLinkItems.map(async (item) => {
                    await actions.deleteBookmarkLink(item.id || '');
                }));
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
                } else if (_getters.isAdminMode || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.publicConfig.delete;
                }
                await fetcher({
                    name: id || '',
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
