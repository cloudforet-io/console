<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import BookmarkDeleteModal from '@/services/workspace-home/components/BookmarkDeleteModal.vue';
import BookmarkFolderFormModal from '@/services/workspace-home/components/BookmarkFolderFormModal.vue';
import BookmarkFullMode from '@/services/workspace-home/components/BookmarkFullMode.vue';
import BookmarkHeader from '@/services/workspace-home/components/BookmarkHeader.vue';
import BookmarkLinkFormModal from '@/services/workspace-home/components/BookmarkLinkFormModal.vue';
import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkBoardSet, BookmarkModalType } from '@/services/workspace-home/types/workspace-home-type';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const { height } = useWindowSize();

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkGetters.bookmarkFolderList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkGetters.bookmarkList),
    isFullMode: computed<boolean>(() => bookmarkGetters.isFullMode),
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkGetters.modal.type),
});
const state = reactive({
    boardSets: computed<BookmarkBoardSet[]>(() => storeState.bookmarkList.map((d) => ({
        ...d,
        rounded: true,
    }))),
    contentHeight: computed<number|undefined>(() => height.value - 392),
});

watch(() => storeState.currentWorkspaceId, async () => {
    if (!storeState.currentWorkspaceId) return;
    await bookmarkStore.fetchBookmarkFolderList();
    await bookmarkStore.fetchBookmarkList();
}, { immediate: true });
</script>

<template>
    <div class="bookmark"
         :class="{ 'full-mode': storeState.isFullMode }"
         :style="{ maxHeight: 'calc(100vh - 20.375rem)' }"
    >
        <bookmark-header :bookmark-folder-list="storeState.bookmarkFolderList" />
        <bookmark-full-mode v-if="storeState.isFullMode"
                            :bookmark-folder-list="storeState.bookmarkFolderList"
                            :bookmark-list="storeState.bookmarkList"
                            :height="state.contentHeight"
        />
        <bookmark-board v-else
                        :board-sets="state.boardSets"
                        class="bookmark-board-wrapper"
        />
        <bookmark-folder-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.FOLDER"
                                    :bookmark-folder-list="storeState.bookmarkFolderList"
        />
        <bookmark-link-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.LINK"
                                  :bookmark-folder-list="storeState.bookmarkFolderList"
                                  :bookmark-list="storeState.bookmarkList"
        />
        <bookmark-delete-modal
            v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_FOLDER || storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_LINK"
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
    .bookmark-board-wrapper {
        @apply grid-cols-7;
    }
}
</style>
