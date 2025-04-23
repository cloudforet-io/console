<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PLazyImg, PI, PEmpty, PCheckbox, PBoardItem, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';

import { blue, gray } from '@/styles/colors';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    boardList: BookmarkItem[];
    isFullMode?: boolean;
    isFolderBoard?: boolean;
    isMaxBoardList?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    boardList: () => ([]),
    isFullMode: false,
    isFolderBoard: false,
    isMaxBoardList: false,
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;
const workspaceHomePageGetters = workspaceHomePageStore.getters;
const authorizationStore = useAuthorizationStore();

const storeState = reactive({
    isWorkspaceMember: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),

    selectedBookmarks: computed<BookmarkItem[]>(() => bookmarkState.selectedBookmarks),
    bookmarkType: computed<BookmarkType|undefined>(() => bookmarkState.bookmarkType),
    filterByFolder: computed<TranslateResult|undefined>(() => bookmarkState.filterByFolder),

    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
    bookmarkFolderData: computed<BookmarkItem[]>(() => workspaceHomePageState.bookmarkFolderData),
    bookmarkList: computed<BookmarkItem[]>(() => workspaceHomePageGetters.bookmarkList),
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
                label: i18n.t('HOME.BOOKMARK_DELETE'),
            },
        ];
        if (props.isFolderBoard) {
            return [
                {
                    icon: 'ic_plus',
                    name: 'add',
                    label: i18n.t('HOME.BOOKMARK_ADD_LINK'),
                },
                { type: 'divider' },
                ...defaultSets,
            ];
        }
        return defaultSets;
    }),
});

const handleUpdateVisibleMenu = (item: BookmarkItem, visibleMenu: boolean) => {
    if (visibleMenu) {
        bookmarkStore.setSelectedBookmark(item, true);
    }
};
const handleSelectDropdownMenu = (item: string) => {
    if (item === 'edit') {
        if (props.isFolderBoard) {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER, true);
        } else {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK, true);
        }
        return;
    }
    if (item === 'delete') {
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
        if (item.id === 'create-folder') {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER);
        } else if (item.id === 'add-link') {
            bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK, false);
        } else {
            workspaceHomePageStore.setFileFullMode(true, item);
            workspaceHomePageStore.fetchBookmarkList();
        }
        return;
    }
    if (item.icon) {
        workspaceHomePageStore.setFullMode(true);
    } else {
        window.open(item.link, '_blank');
    }
};
const handleClickCheckBox = (item: BookmarkItem) => {
    const idx = storeState.selectedBookmarks.findIndex((i) => item.id === i.id);
    if (idx === -1) {
        bookmarkStore.setSelectedBookmarks([
            ...storeState.selectedBookmarks,
            item,
        ]);
        return;
    }
    bookmarkStore.deleteSelectedId(idx);
};
const checkSelectedId = (id?: string) => {
    const idx = storeState.selectedBookmarks.findIndex((i) => id === i.id);
    return idx !== -1;
};
</script>

<template>
    <div class="bookmark-board"
         :class="{
             [props.isFullMode ? 'full-board' : 'collapsed-board']: true,
             'no-data': storeState.bookmarkFolderData.length === 0 && storeState.bookmarkList.length === 0
         }"
    >
        <div v-if="props.boardList.length > 0"
             class="bookmark-board-wrapper"
             :class="{'folder': props.isFolderBoard, 'is-max-board-sets': props.isMaxBoardList}"
        >
            <p-board-item v-for="(item, idx) in props.boardList"
                          :key="idx"
                          class="board-item"
                          :class="{'selected': checkSelectedId(item.id), 'is-global': item?.isGlobal }"
                          @click="handleClickItem(item)"
            >
                <template #content>
                    <p-checkbox v-if="!(storeState.bookmarkType === BOOKMARK_TYPE.WORKSPACE && storeState.isWorkspaceMember) && (props.isFullMode && !item.icon)"
                                :value="true"
                                :disabled="item?.isGlobal"
                                :selected="checkSelectedId(item.id)"
                                @change="handleClickCheckBox(item)"
                    />
                    <div v-if="props.isFolderBoard"
                         class="image-wrapper"
                    >
                        <p-i v-if="item.id === 'create-folder' || item.id === 'add-link'"
                             name="ic_plus"
                             width="1.25rem"
                             height="1.25rem"
                             :color="gray[800]"
                        />
                        <div v-else
                             class="folder-item-icon-wrapper"
                        >
                            <p-i name="ic_folder"
                                 width="1.25rem"
                                 height="1.25rem"
                                 :color="blue[800]"
                            />
                            <p-i v-if="item.isGlobal"
                                 name="ic_globe-filled"
                                 width="0.875rem"
                                 height="0.875rem"
                                 class="global"
                                 :color="gray[600]"
                            />
                        </div>
                    </div>
                    <div v-else
                         class="image-wrapper"
                    >
                        <div v-if="item.imgIcon"
                             class="folder-item-icon-wrapper"
                        >
                            <p-lazy-img :src="assetUrlConverter(item.imgIcon)"
                                        error-icon="ic_link"
                                        :error-icon-color="gray[500]"
                                        class="icon"
                            />
                            <p-i v-if="item.isGlobal"
                                 name="ic_globe-filled"
                                 width="0.875rem"
                                 height="0.875rem"
                                 class="global"
                                 :color="gray[600]"
                            />
                        </div>
                        <div v-else-if="item.icon"
                             class="show-more"
                        >
                            <p-i :name="item.icon"
                                 width="1.25rem"
                                 height="1.25rem"
                                 :color="gray[700]"
                            />
                        </div>
                    </div>
                    <div class="text-wrapper">
                        <div class="title-wrapper">
                            <p-i v-if="props.isFolderBoard && item.id === 'create-folder'"
                                 name="ic_folder"
                                 width="1.125rem"
                                 height="1.125rem"
                            />
                            <p-i v-if="props.isFolderBoard && item.id === 'add-link'"
                                 name="ic_link"
                                 width="1.125rem"
                                 height="1.125rem"
                            />
                            <p class="bookmark-label">
                                {{ item.name }}
                            </p>
                        </div>
                        <p v-if="props.isFullMode"
                           class="bookmark-link"
                        >
                            {{ item.link }}
                        </p>
                    </div>
                </template>
                <template v-if="!(storeState.bookmarkType === BOOKMARK_TYPE.WORKSPACE && storeState.isWorkspaceMember)"
                          #overlay-content
                >
                    <p-select-dropdown v-if="!item.icon && !item.isGlobal"
                                       :menu="state.menuItems"
                                       style-type="icon-button"
                                       button-icon="ic_ellipsis-horizontal"
                                       use-fixed-menu-style
                                       class="overlay"
                                       reset-selected-on-unmounted
                                       menu-position="right"
                                       @select="handleSelectDropdownMenu"
                                       @update:visible-menu="handleUpdateVisibleMenu(item, $event)"
                    />
                </template>
            </p-board-item>
        </div>
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
            .content {
                @apply flex items-center;
                gap: 0.5rem;
                width: 100%;
            }
            .right-overlay-wrapper {
                top: 0.75rem;
                right: 0.5rem;
                .overlay-contents {
                    @apply bg-white;
                }
            }
        }

        .board-item {
            @apply relative bg-white border border-gray-150 box-border cursor-pointer;
            min-height: 3.625rem;
            max-height: 3.625rem;
            box-shadow: none;
            padding: 0.5rem 0.75rem 0.5rem 0.5rem;
            border-radius: 0.75rem;

            &:hover {
                @apply border border-blue-500;
                box-shadow: 0 0 4px 0 rgba(0, 178, 255, 0.4);

                &:not(.is-global) {
                    .text-wrapper {
                        max-width: calc(100% - 4.5rem);
                    }
                }
            }

            .image-wrapper {
                @apply relative flex items-center justify-center;
                width: 2rem;
                height: 2rem;
                border-radius: 0.375rem;
                .folder-item-icon-wrapper {
                    width: 1.25rem;
                    height: 1.25rem;
                    .global {
                        @apply absolute bg-gray-150 rounded-full;
                        width: 0.875rem !important;
                        height: 0.875rem !important;
                        right: 0;
                        bottom: 0;
                    }
                }

                /* custom design-system component - p-lazy-img */
                :deep(.p-lazy-img) {
                    img {
                        width: 1.25rem !important;
                        height: 1.25rem !important;
                    }

                    .error {
                        svg {
                            width: 1.25rem !important;
                            height: 1.25rem !important;
                        }
                    }
                }

                .icon, svg {
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
                max-width: calc(100% - 2.5rem);
                .title-wrapper {
                    @apply flex items-center;
                    gap: 0.25rem;
                }
                .bookmark-label {
                    @apply truncate;
                }

                .bookmark-link {
                    @apply text-label-sm text-gray-500 truncate;
                }
            }

            .overlay {
                @apply rounded-full;
                width: 2rem;
                height: 2rem;
            }

            /* custom design-system component - p-select-dropdown */
            :deep(.p-select-dropdown) {
                .p-context-menu-item.selected {
                    @apply bg-white;
                    &:hover {
                        @apply bg-blue-100;
                    }
                }
            }
        }
    }

    &.collapsed-board {
        .bookmark-board-wrapper {
            @apply grid-cols-7;
        }

        @screen tablet {
            .bookmark-board-wrapper {
                grid-template-columns: repeat(4, minmax(0, 1fr));
            }
        }

        @screen laptop {
            .bookmark-board-wrapper {
                &.is-max-board-sets {
                    /* custom design-system component - p-board-item */
                    :deep(.p-board-item) {
                        &:last-child {
                            .content {
                                align-items: center;
                                justify-content: center;
                                .bookmark-label {
                                    display: none;
                                }
                            }
                        }
                    }
                }

                /* custom design-system component - p-board-item */
                :deep(.p-board-item) {
                    padding: 0.5rem;
                    .content {
                        flex-direction: column;
                        gap: 0.125rem;
                    }
                }

                .board-item {
                    min-height: initial;
                    max-height: initial;
                    .image-wrapper {
                        width: 1.25rem;
                        height: 1.25rem;

                        .icon, img {
                            width: 1.25rem !important;
                            height: 1.25rem !important;
                        }

                        .show-more {
                            background-color: transparent;
                        }

                        .folder-item-icon-wrapper {
                            .global {
                                right: -0.375rem;
                                bottom: -0.25rem;
                            }
                        }
                    }
                    &:hover {
                        &:not(.is-global) {
                            .text-wrapper {
                                max-width: calc(100% - 2.5rem);
                            }
                        }
                        .overlay {
                            display: none;
                        }
                    }
                }
            }
        }
    }

    &.full-board {
        padding-top: 0;
        .bookmark-board-wrapper {
            @apply grid-cols-4;

            @screen tablet {
                grid-template-columns: repeat(1, minmax(0, 1fr));

                /* custom design-system component - p-board-item */
                :deep(.p-board-item) {
                    .content-area .desktop {
                        display: block;
                    }
                }
            }

            /* custom design-system component - p-board-item */
            :deep(.p-board-item) {
                &.selected {
                    @apply bg-blue-100;
                    .overlay-contents {
                        @apply bg-blue-100;
                    }
                }
            }

            .board-item {
                @apply border-gray-200;
                padding: 0.5rem;

                .text-wrapper {
                    max-width: calc(100% - 4.25rem);

                    @screen tablet {
                        max-width: calc(100% - 6.5rem);
                    }
                }
                &:hover {
                    @apply border-blue-500;
                    &:not(.is-global) {
                        .text-wrapper {
                            max-width: calc(100% - 6.5rem);
                        }
                    }
                    .overlay {
                        @apply block;
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
            }
        }
    }

    &.no-data {
        padding-top: 0;
    }

    .empty {
        height: 3.5rem;
    }
}
</style>
