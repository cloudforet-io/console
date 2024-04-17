<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PBoard, PLazyImg, PI } from '@spaceone/design-system';
import { BOARD_STYLE_TYPE } from '@spaceone/design-system/src/data-display/board/type';

import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { blue, gray } from '@/styles/colors';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkBoardSet } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    boardSets: BookmarkBoardSet[];
    isFullMode?: boolean;
    isFolderBoard?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    boardSets: () => ([]),
    isFullMode: false,
    isFolderBoard: false,
});

const bookmarkStore = useBookmarkStore();

const state = reactive({
    boardSets: computed<BookmarkBoardSet[]>(() => {
        const result: BookmarkBoardSet[] = props.boardSets;
        if (!props.isFullMode && result.length === 13) {
            result.push({
                name: i18n.t('HOME.TOGGLE_MORE') as string,
                icon: 'ic_ellipsis-horizontal',
                isShowMore: true,
                rounded: true,
            });
        }
        return result;
    }),
});

const handleClickItem = (item) => {
    if (props.isFolderBoard) {
        if (item.icon) {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER);
        } else {
            const idx = state.boardSets.findIndex((i) => i.name === item.name);
            bookmarkStore.setFileFullMode(true);
            bookmarkStore.setActiveButtonIdx(idx - 1);
        }
        return;
    }
    if (item.icon) {
        bookmarkStore.setFullMode(true);
    } else {
        window.open(item.link, '_blank');
    }
};
</script>

<template>
    <p-board :board-sets="state.boardSets"
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
                    <p-i v-if="board.icon"
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
                        v-if="board.imgIcon"
                        :src="assetUrlConverter(board.imgIcon)"
                        width="1.5rem"
                        height="1.5rem"
                        class="icon"
                    />
                    <div v-else-if="board.icon"
                         class="show-more"
                    >
                        <p-i :name="board.icon"
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
