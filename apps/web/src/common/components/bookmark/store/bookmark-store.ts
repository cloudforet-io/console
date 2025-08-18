import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import type { BookmarkItem, BookmarkModalStateType, BookmarkModalType } from '@/common/components/bookmark/type/type';

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
            state.filterByFolder = undefined;
            state.selectedBookmark = undefined;
            state.selectedBookmarks = [];
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
