<script setup lang="ts">
import { computed, reactive } from 'vue';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkBoardSet } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList: BookmarkItem[];
    bookmarkList: BookmarkItem[];
    height?: number;
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
    bookmarkList: undefined,
    height: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;

const storeState = reactive({
    isFileFullMode: computed<boolean>(() => bookmarkState.isFileFullMode),
});
const state = reactive({
    folderBoardSets: computed<BookmarkBoardSet[]>(() => {
        const createFolderItem: BookmarkBoardSet = {
            name: 'create Folder',
            icon: 'ic_plus',
            rounded: true,
        };
        return [createFolderItem, ...props.bookmarkFolderList.map((folder) => ({
            ...folder,
            rounded: true,
        }))];
    }),
    boardSets: computed<BookmarkBoardSet[]>(() => props.bookmarkList.map((d) => ({
        ...d,
        rounded: true,
    }))),
    isFullMode: false,
});
</script>

<template>
    <div class="bookmark-full-mode"
         :style="{ maxHeight: `${props.height}px` }"
    >
        <bookmark-board v-if="!storeState.isFileFullMode"
                        :board-sets="state.folderBoardSets"
                        is-folder-board
                        is-full-mode
                        class="bookmark-board-wrapper"
        />
        <bookmark-board :board-sets="state.boardSets"
                        is-full-mode
                        class="bookmark-board-wrapper"
        />
    </div>
</template>

<style scoped lang="postcss">
.bookmark-full-mode {
    @apply flex flex-col text-label-md overflow-y-auto;
    width: 100%;
    min-height: 15.875rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    gap: 1.25rem;
    .bookmark-board-wrapper {
        @apply grid-cols-4;
    }

    @screen tablet {
        .bookmark-board-wrapper {
            @apply grid-cols-1;
        }
    }
}
</style>
