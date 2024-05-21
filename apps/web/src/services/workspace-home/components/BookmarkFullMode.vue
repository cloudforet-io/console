<script setup lang="ts">
import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem } from '@/services/workspace-home/types/workspace-home-type';

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
    folderBoardSets: computed<BookmarkItem[]>(() => {
        const createFolderItem: BookmarkItem = {
            name: i18n.t('HOME.BOOKMARK_CREATE_FOLDER'),
            icon: 'ic_plus',
        };
        return [createFolderItem, ...props.bookmarkFolderList];
    }),
    isFullMode: false,
});
</script>

<template>
    <div class="bookmark-full-mode"
         :style="{ maxHeight: `${props.height}px` }"
    >
        <bookmark-board v-if="!storeState.isFileFullMode"
                        :board-list="state.folderBoardSets"
                        is-folder-board
                        is-full-mode
                        class="board"
        />
        <bookmark-board :board-list="props.bookmarkList"
                        is-full-mode
                        class="board"
        />
    </div>
</template>

<style scoped lang="postcss">
.bookmark-full-mode {
    @apply flex flex-col text-label-md overflow-y-auto;
    width: 100%;
    min-height: 15.875rem;
    margin-top: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    gap: 1.25rem;

    .board {
        + .board {
            padding-top: 0;
        }
    }
}
</style>
