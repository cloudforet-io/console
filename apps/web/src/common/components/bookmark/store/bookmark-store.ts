import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

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
        updateBookmarkLink: async ({
            id, name, link, folder,
        }: { id: string, name?: string|TranslateResult, link?: string, folder?: string}) => {
            try {
                let fetcher;
                if (state.bookmarkType === BOOKMARK_TYPE.USER) {
                    fetcher = SpaceConnector.clientV2.config.userConfig.update;
                } else if (_getters.isAdminMode || state.bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
                    fetcher = SpaceConnector.clientV2.config.sharedConfig.update;
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
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
