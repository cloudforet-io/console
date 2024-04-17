<script setup lang="ts">
import { computed, reactive } from 'vue';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';
import type { BookmarkItem, BookmarkBoardSet } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkList: BookmarkItem[];
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkList: undefined,
});

const state = reactive({
    folderBoardSets: computed<BookmarkBoardSet[]>(() => {
        const _results = props.bookmarkList as BookmarkBoardSet[];
        return _results.map((d) => ({
            ...d,
            rounded: true,
        }));
    }),
    boardSets: computed<BookmarkBoardSet[]>(() => props.bookmarkList.map((d) => ({
        ...d,
        rounded: true,
    }))),
    isFullMode: false,
});
</script>

<template>
    <div class="bookmark-full-mode">
        <bookmark-board :board-sets="state.folderBoardSets"
                        is-folder-board
                        class="bookmark-board-wrapper folder"
        />
        <bookmark-board :board-sets="state.boardSets"
                        is-full-mode
                        class="bookmark-board-wrapper"
        />
    </div>
</template>

<style scoped lang="postcss">
.bookmark-full-mode {
    @apply flex flex-col text-label-md;
    width: 100%;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    gap: 1.25rem;
    .bookmark-board-wrapper {
        @apply grid-cols-4;

        &.folder {
            /* custom design-system component - p-board-item */
            :deep(.p-board-item) {
                .board-item {
                    .image-wrapper {
                        @apply bg-blue-200;
                    }
                }
            }
        }

        /* custom design-system component - p-board-item */
        :deep(.p-board-item) {
            @apply border-gray-200;
            padding: 0.5rem;
            .board-item {
                .image-wrapper {
                    @apply bg-gray-100;
                }
            }
        }
    }
}
</style>
