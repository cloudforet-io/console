<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, onUnmounted, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { screens } from '@spaceone/design-system';

import { i18n } from '@/translations';

import BookmarkDeleteModal from '@/common/components/bookmark/BookmarkDeleteModal.vue';
import BookmarkFolderFormModal from '@/common/components/bookmark/BookmarkFolderFormModal.vue';
import BookmarkLinkFormModal from '@/common/components/bookmark/BookmarkLinkFormModal.vue';
import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/common/components/bookmark/type/type';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import BookmarkFullMode from '@/services/workspace-home/components/BookmarkFullMode.vue';
import BookmarkHeader from '@/services/workspace-home/components/BookmarkHeader.vue';
import {
    MAX_BOARD_SETS,
    MAX_BOARD_SETS_TABLET,
} from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomeState = workspaceHomePageStore.state;
const workspaceHomeGetters = workspaceHomePageStore.getters;
const { width } = useWindowSize();

const storeState = reactive({
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    filterByFolder: computed<undefined|TranslateResult>(() => bookmarkState.filterByFolder),

    bookmarkFolderList: computed<BookmarkItem[]>(() => workspaceHomeState.bookmarkFolderData),
    bookmarkList: computed<BookmarkItem[]>(() => workspaceHomeGetters.bookmarkList),
    isFullMode: computed<boolean>(() => workspaceHomeState.isFullMode),
    isFileFullMode: computed<boolean|undefined>(() => workspaceHomeState.isFileFullMode),
});
const state = reactive({
    isTabletSize: computed<boolean>(() => width.value < screens.tablet.max),
    maxBoardSets: computed<number>(() => (state.isTabletSize ? MAX_BOARD_SETS_TABLET : MAX_BOARD_SETS)),
    boardList: computed<BookmarkItem[]>(() => {
        let _bookmarkList: BookmarkItem[] = [];
        if (storeState.isFullMode) return storeState.bookmarkList;
        _bookmarkList = storeState.bookmarkList.slice(0, state.maxBoardSets);
        if (_bookmarkList.length === state.maxBoardSets) {
            _bookmarkList.push({
                name: i18n.t('HOME.TOGGLE_MORE') as string,
                icon: 'ic_ellipsis-horizontal',
                isShowMore: true,
            });
        }
        return _bookmarkList;
    }),
});

const handleCreateFolder = async (_, name?: string) => {
    await workspaceHomePageStore.fetchBookmarkFolderList();
    if (storeState.isFileFullMode) {
        await bookmarkStore.setSelectedBookmark({
            ...storeState.selectedBookmark,
            name,
        });
    }
};
const handleCreateLink = async (selectedFolder?: BookmarkItem, scope?: BookmarkType) => {
    await bookmarkStore.setBookmarkType(scope);
    await bookmarkStore.setSelectedBookmark(selectedFolder);
    await workspaceHomePageStore.fetchBookmarkList();
    await workspaceHomePageStore.fetchBookmarkList();
    if (storeState.isFullMode && selectedFolder) {
        if (selectedFolder?.id) {
            await workspaceHomePageStore.setFileFullMode(true, selectedFolder);
        } else {
            await workspaceHomePageStore.setFullMode(true);
        }
    }
};
const handleConfirmDelete = () => {
    if (storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_FOLDER) {
        if (storeState.isFileFullMode) {
            workspaceHomePageStore.setFullMode(true);
            bookmarkStore.setSelectedBookmark(undefined);
        }
    } else if (storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_LINK) {
        if (storeState.isFileFullMode) {
            const folder = storeState.bookmarkFolderList?.find((i) => i.id === storeState.selectedBookmark?.folder);
            bookmarkStore.setSelectedBookmark(folder);
        }
    }
    workspaceHomePageStore.fetchBookmarkFolderList();
    workspaceHomePageStore.fetchBookmarkList();
};

onUnmounted(() => {
    bookmarkStore.resetState();
});
</script>

<template>
    <div class="bookmark"
         :class="{ 'full-mode': storeState.isFullMode }"
    >
        <bookmark-header :bookmark-folder-list="storeState.bookmarkFolderList" />
        <bookmark-full-mode v-if="storeState.isFullMode"
                            :bookmark-folder-list="storeState.bookmarkFolderList"
                            :bookmark-list="storeState.bookmarkList"
        />
        <bookmark-board v-else
                        :board-list="state.boardList"
                        :is-max-board-list="state.boardList.length === state.maxBoardSets + 1"
        />
        <bookmark-folder-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.FOLDER"
                                    :bookmark-folder-list="storeState.bookmarkFolderList"
                                    :bookmark-list="storeState.bookmarkList"
                                    :filter-by-folder="storeState.filterByFolder"
                                    @confirm="handleCreateFolder"
        />
        <bookmark-link-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.LINK"
                                  :bookmark-folder-list="storeState.bookmarkFolderList"
                                  @confirm="handleCreateLink"
        />
        <bookmark-delete-modal
            v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_FOLDER
                || storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_LINK
                || storeState.modalType === BOOKMARK_MODAL_TYPE.MULTI_DELETE"
            :bookmark-list="storeState.bookmarkList"
            @confirm="handleConfirmDelete"
        />
    </div>
</template>

<style scoped lang="postcss">
.bookmark {
    @apply border border-gray-200;
    padding: 1rem;
    border-radius: 0.375rem;

    &.full-mode {
        @apply relative bg-white;
        min-height: 22.5rem;
        padding-bottom: 2.5rem;
    }
}
</style>
