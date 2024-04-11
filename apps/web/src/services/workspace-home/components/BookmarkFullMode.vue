<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import BookmarkBoard from '@/services/workspace-home/components/BookmarkBoard.vue';

interface Props {
    // TODO: will be changed to real type
    bookmarkList: any;
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkList: [],
});

const storeState = reactive({
    // TODO: will be changed to data
    bookmarkFolderList: computed(() => [
        { title: 'Create Folder', id: '1', isCreate: true },
        { title: 'Folder 1', id: '1' },
        { title: 'Folder 2', id: '2' },
        { title: 'Folder 3', id: '3' },
        { title: 'Folder 4', id: '4' },
    ]),
});

const state = reactive({
    folderBoardSets: computed<BoardSet[]>(() => storeState.bookmarkFolderList.map((d) => ({
        ...d,
        rounded: true,
    }))),
    boardSets: computed<BoardSet[]>(() => props.bookmarkList.map((d) => ({
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
