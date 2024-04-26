<script setup lang="ts">
import {
    computed, onBeforeUnmount, onMounted, reactive, ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PBoard, PLazyImg, PI, PIconButton, PContextMenu, PEmpty,
} from '@spaceone/design-system';
import { BOARD_STYLE_TYPE } from '@spaceone/design-system/src/data-display/board/type';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import { CONTEXT_MENU_TYPE } from '@spaceone/design-system/src/inputs/context-menu/type';

import type { UserConfigModel } from '@/schema/config/user-config/model';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { blue, gray } from '@/styles/colors';

import {
    BOOKMARK_MODAL_TYPE,
} from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { BookmarkBoardSet, BookmarkItem } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    boardSets: BookmarkBoardSet[];
    isFullMode?: boolean;
    isFolderBoard?: boolean;
    isMaxBoardSets?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    boardSets: () => ([]),
    isFullMode: false,
    isFolderBoard: false,
    isMaxBoardSets: false,
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const bookmarkGetters = bookmarkStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;

const boardItemEl = ref<HTMLElement | null>(null);

const storeState = reactive({
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
    bookmarkFolderData: computed<BookmarkItem[]>(() => bookmarkState.bookmarkFolderData),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkGetters.bookmarkList),
    filterByFolder: computed<string|undefined|TranslateResult>(() => bookmarkState.filterByFolder),
});
const state = reactive({
    menuItems: computed<MenuItem[]>(() => {
        const defaultSets: MenuItem[] = [
            {
                icon: 'ic_edit',
                name: 'edit',
                label: i18n.t('HOME.BOOKMARK_EDIT'),
            },
            {
                icon: 'ic_delete',
                name: 'delete',
                label: i18n.t('HOME.BOOKMARK_REMOVE'),
            },
        ];
        if (props.isFolderBoard) {
            return [
                {
                    icon: 'ic_plus',
                    name: 'add',
                    label: i18n.t('HOME.BOOKMARK_ADD_LINK'),
                },
                { type: CONTEXT_MENU_TYPE.divider },
                ...defaultSets,
            ];
        }
        return defaultSets;
    }),
    menuVisible: false,
});

const handleClickDropdownButton = (item: BookmarkItem) => {
    state.menuVisible = !state.menuVisible;
    bookmarkStore.setSelectedBookmark(item, true);
};
const handleSelectDropdownMenu = (item: MenuItem) => {
    if (item.name === 'edit') {
        if (props.isFolderBoard) {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER, true);
        } else {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK, true);
        }
        return;
    }
    if (item.name === 'delete') {
        if (props.isFolderBoard) {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.DELETE_FOLDER);
        } else {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.DELETE_LINK);
        }
        return;
    }

    bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK, false);
};
const handleClickItem = (item) => {
    if (props.isFolderBoard) {
        if (item.icon) {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER);
        } else {
            bookmarkStore.setFileFullMode(true, item);
        }
        return;
    }
    if (item.icon) {
        bookmarkStore.setFullMode(true);
    } else {
        window.open(item.link, '_blank');
    }
};

const handleClickOutside = (event) => {
    if (!props.isFullMode) return;
    if (!event.relatedTarget) {
        state.menuVisible = false;
    }
};


onMounted(() => {
    document.addEventListener('focusout', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('focusout', handleClickOutside);
});
</script>

<template>
    <div class="bookmark-board"
         :class="{
             [props.isFullMode ? 'full-board' : 'collapsed-board']: true,
             'no-data': storeState.bookmarkFolderData.length === 0 && storeState.bookmarkList.length === 0
         }"
    >
        <p-board v-if="props.boardSets.length > 0"
                 :board-sets="props.boardSets"
                 selectable
                 :style-type="BOARD_STYLE_TYPE.cards"
                 class="bookmark-board-wrapper"
                 :class="{'folder': props.isFolderBoard, 'is-max-board-sets': props.isMaxBoardSets}"
                 @item-click="handleClickItem"
        >
            <template #item-content="{board}">
                <div ref="boardItemEl"
                     class="board-item"
                >
                    <div v-if="props.isFolderBoard"
                         class="image-wrapper"
                    >
                        <p-i v-if="board.icon"
                             name="ic_plus"
                             width="1.25rem"
                             height="1.25rem"
                             :color="gray[800]"
                        />
                        <p-i v-else
                             name="ic_folder"
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
                            error-icon="ic_globe-filled"
                            :error-icon-color="gray[500]"
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
                    <div v-if="!board.icon"
                         class="toolsets-wrapper"
                    >
                        <p-icon-button name="ic_ellipsis-horizontal"
                                       size="md"
                                       :color="blue[600]"
                                       @click.stop="handleClickDropdownButton(board)"
                        />
                        <p-context-menu v-if="state.menuVisible"
                                        :menu="state.menuItems"
                                        class="toolsets-context-menu"
                                        no-select-indication
                                        @select="handleSelectDropdownMenu"
                        />
                    </div>
                </div>
            </template>
        </p-board>
        <p-empty v-else-if="storeState.recentList.length > 0 && storeState.filterByFolder"
                 class="empty"
        >
            {{ $t('HOME.EMPTY_LINK') }}
        </p-empty>
    </div>
</template>

<style scoped lang="postcss">
.bookmark-board {
    padding-top: 1rem;

    .bookmark-board-wrapper {
        @apply grid gap-2 text-label-md;

        /* custom design-system component - p-board-item */
        :deep(.p-board-item) {
            @apply relative border-gray-150;
            min-height: 3.5rem;
            padding: 0.5rem 0.75rem 0.5rem 0.5rem;
            border-radius: 0.75rem;
            box-shadow: none;

            &:hover {
                @apply bg-white border border-blue-500;
                box-shadow: 0 0 4px 0 rgba(0, 178, 255, 0.4);
                .board-item .text-wrapper {
                    max-width: calc(100% - 4.5rem);
                }
                .toolsets-wrapper {
                    @apply block;
                }
            }

            .content {
                width: 100%;
            }

            .board-item {
                @apply flex items-center;
                gap: 0.5rem;

                .image-wrapper {
                    @apply flex items-center justify-center;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 0.375rem;

                    .icon, img, svg {
                        width: 1.25rem !important;
                        height: 1.25rem !important;
                    }

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

            .toolsets-wrapper {
                @apply absolute hidden bg-blue-300 rounded-full;
                top: 0.75rem;
                right: 0.5rem;
                width: 2rem;
                height: 2rem;

                /* custom design-system component - p-icon-button */
                :deep(.p-icon-button) {
                    @apply relative;
                }

                .toolsets-context-menu {
                    @apply absolute;
                    right: 0;
                    min-width: 7.25rem;
                    z-index: 10;
                }
            }
        }
    }

    &.collapsed-board {
        .bookmark-board-wrapper {
            @apply grid-cols-7;
            .toolsets-wrapper {
                @apply bg-white;
            }
        }

        @screen tablet {
            .bookmark-board-wrapper {
                @apply grid-cols-4;
            }
        }

        @screen laptop {
            .bookmark-board-wrapper {
                /* custom design-system component - p-board-item */
                :deep(.p-board-item) {
                    &:last-child {
                        .board-item {
                            height: 1.25rem;

                            .bookmark-label {
                                @apply hidden;
                            }
                        }
                    }
                    &:hover {
                        .toolsets-wrapper {
                            @apply hidden;
                        }
                    }
                    .toolsets-wrapper {
                        @apply hidden;
                    }
                    .board-item .text-wrapper {
                        max-width: calc(100% - 3rem);
                    }
                }
            }

            /* custom design-system component - p-board-item */
            :deep(.p-board-item) {
                min-height: 3.625rem;
                padding: 0.5rem;

                .board-item {
                    @apply flex-col;
                    gap: 0.375rem;

                    .image-wrapper {
                        width: 1.25rem;
                        height: 1.25rem;

                        .icon, img {
                            width: 1.25rem !important;
                            height: 1.25rem !important;
                        }

                        .show-more {
                            @apply bg-transparent;
                        }
                    }
                }
            }
        }
    }

    &.full-board {
        .bookmark-board-wrapper {
            @apply grid-cols-4;

            @screen tablet {
                @apply grid-cols-1;
            }

            /* custom design-system component - p-board-item */
            :deep(.p-board-item) {
                @apply border-gray-200;
                padding: 0.5rem;

                &:hover {
                    @apply border-blue-500;
                }

                &:first-child {
                    .image-wrapper {
                        @apply bg-gray-100;
                    }
                }
            }

            &:not(.folder) {
                padding-top: 0;
                .image-wrapper {
                    @apply bg-gray-100;
                }
            }

            &.folder {
                .image-wrapper {
                    @apply bg-blue-200;
                }

                /* custom design-system component - p-board-item */
                :deep(.p-board-item) {
                    &:first-child {
                        .image-wrapper {
                            @apply bg-white;
                        }
                    }
                }
            }
        }
    }

    &.no-data {
        padding-top: 0;
        .empty {
            padding-top: 1.125rem;
            padding-bottom: 1.125rem;
        }
    }
}
</style>
