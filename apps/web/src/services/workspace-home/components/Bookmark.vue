<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import BookmarkFullMode from '@/services/workspace-home/components/BookmarkFullMode.vue';
import BookmarkHeader from '@/services/workspace-home/components/BookmarkHeader.vue';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    bookmarkFolderList: computed(() => bookmarkGetters.bookmarkFolderList),
    bookmarkList: computed(() => bookmarkGetters.bookmarkList),
});
const state = reactive({
    boardSets: computed<BoardSet[]>(() => storeState.bookmarkList.map((d) => ({
        ...d,
        rounded: true,
    }))),
    isFullMode: false,
});

watch(() => storeState.currentWorkspaceId, async () => {
    if (!storeState.currentWorkspaceId) return;
    await bookmarkStore.fetchBookmarkList();
}, { immediate: true });
</script>

<template>
    <div class="bookmark"
         :class="{ 'full-mode': state.isFullMode }"
    >
        <bookmark-header :is-full-mode.sync="state.isFullMode"
                         :bookmark-folder-list="storeState.bookmarkFolderList"
        />
        <bookmark-full-mode v-if="state.isFullMode"
                            :bookmark-list="storeState.bookmarkFolderList"
        />
        <bookmark-board v-else
                        :board-sets="state.boardSets"
                        class="bookmark-board-wrapper"
        />
    </div>
</template>

<style scoped lang="postcss">
.bookmark {
    @apply border border-gray-200;
    padding: 1rem;
    border-radius: 0.375rem;

    &.full-mode {
        @apply bg-white;
        padding-bottom: 2.5rem;
    }
    .bookmark-board-wrapper {
        @apply grid-cols-7;
    }
}
</style>
