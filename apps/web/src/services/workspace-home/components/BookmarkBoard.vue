<script setup lang="ts">
import { PBoard, PLazyImg, PI } from '@spaceone/design-system';
import { BOARD_STYLE_TYPE } from '@spaceone/design-system/src/data-display/board/type';
import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { blue, gray } from '@/styles/colors';

import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';

interface Props {
    boardSets: BoardSet[];
    isFullMode?: boolean;
    isFolderBoard?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    boardSets: () => ([]),
    isFullMode: false,
    isFolderBoard: false,
});

const bookmarkStore = useBookmarkStore();

const handleClickItem = (item) => {
    if (!item.isShowMore) {
        window.open(item.link, '_blank');
        return;
    }
    bookmarkStore.setFullMode(true);
};
</script>

<template>
    <p-board :board-sets="props.boardSets"
             selectable
             :style-type="BOARD_STYLE_TYPE.cards"
             class="bookmark-board"
             @item-click="handleClickItem"
    >
        <template #item-content="{board}">
            <div class="board-item">
                <div v-if="props.isFolderBoard"
                     class="image-wrapper"
                >
                    <p-i v-if="board.isCreate"
                         name="ic_plus"
                         width="1.25rem"
                         height="1.25rem"
                         :color="blue[800]"
                    />
                    <p-i v-else
                         name="ic_folder-filled"
                         width="1.25rem"
                         height="1.25rem"
                         :color="blue[800]"
                    />
                </div>
                <div v-else
                     class="image-wrapper"
                >
                    <p-lazy-img
                        v-if="board.icon"
                        :src="assetUrlConverter(board.icon)"
                        width="1.5rem"
                        height="1.5rem"
                        class="icon"
                    />
                    <div v-else-if="board.isShowMore"
                         class="show-more"
                    >
                        <p-i name="ic_ellipsis-horizontal"
                             width="1.25rem"
                             height="1.25rem"
                             :color="gray[700]"
                        />
                    </div>
                    <p-i v-else
                         name="ic_globe-filled"
                         width="1.5rem"
                         height="1.5rem"
                         :color="gray[500]"
                    />
                </div>
                <div class="text-wrapper">
                    <p class="bookmark-label">
                        {{ board.name }}
                    </p>
                    <p v-if="props.isFullMode"
                       class="bookmark-link"
                    >
                        {{ board.link }}
                    </p>
                </div>
            </div>
        </template>
    </p-board>
</template>

<style scoped lang="postcss">
.bookmark-board {
    @apply grid gap-2 text-label-md;

    /* custom design-system component - p-board-item */
    :deep(.p-board-item) {
        @apply relative border-gray-150;
        min-height: 3.5rem;
        max-height: 3.5rem;
        padding: 0.5rem 0.75rem 0.5rem 0.5rem;
        border-radius: 0.75rem;
        box-shadow: none;
        .content {
            width: 100%;
        }

        .board-item {
            @apply flex items-center;
            gap: 0.5rem;
            .image-wrapper {
                @apply flex items-center justify-center;
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 0.75rem;
                .show-more {
                    @apply flex items-center justify-center bg-gray-100 rounded-xl;
                    width: 2.5rem;
                    height: 2.5rem;
                }
            }
            .text-wrapper {
                max-width: calc(100% - 3rem);
                .bookmark-label {
                    @apply truncate;
                }
                .bookmark-link {
                    @apply text-label-sm text-gray-500 truncate;
                }
            }
        }
    }
}
</style>
