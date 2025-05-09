<script setup lang="ts">
import { useElementBounding, useElementSize } from '@vueuse/core';
import { useWindowSize } from '@vueuse/core/index';
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { sumBy } from 'lodash';

import {
    PButton,
    PFieldTitle,
    PI,
    PIconButton,
    PTextButton,
    screens,
    PContextMenu,
    useContextMenuController,
    PSelectButtonGroup,
} from '@cloudforet/mirinae';
import type { ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/common/components/bookmark/type/type';

import { gray } from '@/styles/colors';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { MoreMenuItem, BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
});

const FOLDER_DEFAULT_GAP = 4;

const userStore = useUserStore();
const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;

const { width } = useWindowSize();

const componentRef = ref<HTMLElement|null>(null);
const folderItemsRef = ref<HTMLElement[]|null>(null);

const moreButtonRef = ref<HTMLElement | null>(null);
const moreContextMenuRef = ref<any|null>(null);

const { width: containerWidth } = useElementSize(componentRef);
const { top: moreButtonTop, height: moreButtonHeight } = useElementBounding(moreButtonRef);

const storeState = reactive({
    isWorkspaceMember: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    language: computed<string|undefined>(() => userStore.state.language),

    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    selectedBookmarks: computed<BookmarkItem[]>(() => bookmarkState.selectedBookmarks),
    bookmarkType: computed<BookmarkType|undefined>(() => bookmarkState.bookmarkType),
    filterByFolder: computed<TranslateResult|undefined>(() => bookmarkState.filterByFolder),
    isFullMode: computed<boolean>(() => workspaceHomePageState.isFullMode),
    isFileFullMode: computed<boolean>(() => workspaceHomePageState.isFileFullMode),
});
const state = reactive({
    isLaptopSize: computed<boolean>(() => width.value < screens.laptop.max),
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    folderListMaxWidth: computed<number>(() => containerWidth.value),

    refinedFolderList: [] as BookmarkItem[],
    refinedFolderListWidth: 0,

    tools: computed<ValueItem[]>(() => ([
        {
            name: BOOKMARK_TYPE.WORKSPACE,
            label: state.isMobileSize ? i18n.t('HOME.BOOKMARK_SHARED') as string : i18n.t('HOME.BOOKMARK_SHARED_BOOKMARK') as string,
        },
        {
            name: BOOKMARK_TYPE.USER,
            label: state.isMobileSize ? i18n.t('HOME.BOOKMARK_MY') as string : i18n.t('HOME.BOOKMARK_MY_BOOKMARK') as string,
        },
    ])),
    selectedToolId: BOOKMARK_TYPE.WORKSPACE,
});
const moreState = reactive({
    isShowMoreButton: false,
    menuItems: computed<MoreMenuItem[]>(() => state.refinedFolderList.map((i) => ({
        ...i,
        name: i.id,
        label: i.name,
        type: 'item',
    }))),
    selectedItems: [] as MoreMenuItem[],
});

const {
    visibleMenu: visibleContextMenu,
    showContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef: moreButtonRef,
    contextMenuRef: moreContextMenuRef,
    selected: moreState.selectedItems,
    menu: moreState.menuItems,
    position: 'right',
});

const handleClickFullModeButton = () => {
    workspaceHomePageStore.setFullMode(!storeState.isFullMode);
};
const handleClickActionButton = (type: BookmarkModalType, isEdit?: boolean, isNew?: boolean) => {
    bookmarkStore.setModalType(type, isEdit, isNew);
};
const handleClickFolder = (item: BookmarkItem, isClickedMore?: boolean) => {
    if (!isClickedMore) {
        moreState.selectedItems = [];
        hideContextMenu();
    }
    if (storeState.filterByFolder === item.name) {
        bookmarkStore.setSelectedBookmark(undefined);
        return;
    }
    bookmarkStore.setSelectedBookmark(item);
};
const handleGoBackButton = () => {
    workspaceHomePageStore.setFileFullMode(false);
    workspaceHomePageStore.fetchBookmarkList();
};

const handleClickAddMore = () => {
    if (visibleContextMenu.value) {
        hideContextMenu();
    } else {
        showContextMenu();
    }
};
const handleSelectAddMoreMenuItem = (item: MoreMenuItem) => {
    if (moreState.selectedItems[0]?.name === item?.name) {
        moreState.selectedItems = [];
    } else {
        moreState.selectedItems = [item];
    }
    handleClickFolder({
        id: item.name,
        name: item.label,
        workspaceId: item.workspaceId,
    }, true);
    hideContextMenu();
};
const handleClickAllSelection = () => {
    bookmarkStore.setSelectedBookmark(undefined);
    moreState.selectedItems = [];
    hideContextMenu();
};
const handleSelectTool = async (value: BookmarkType) => {
    state.selectedToolId = value;
    bookmarkStore.setBookmarkType(value);
    bookmarkStore.setSelectedBookmarks([]);

    await workspaceHomePageStore.fetchBookmarkFolderList();
    await workspaceHomePageStore.fetchBookmarkList();
    await bookmarkStore.setSelectedBookmark(undefined);
};

watch([
    () => storeState.language,
    () => folderItemsRef,
    () => state.folderListMaxWidth,
    () => props.bookmarkFolderList,
    () => storeState.isFullMode,
], async ([language, folderItemsValue, folderListMaxWidth, bookmarkFolderList]) => {
    state.refinedFolderListWidth = folderListMaxWidth;
    await nextTick();
    const moreButtonWidth = language === 'ja' ? 108 : 74;
    const folderListWidthWithoutMoreButton = folderListMaxWidth - moreButtonWidth;
    const _refinedFolderList: HTMLElement[] = [];
    let widthBaseline = 0;
    folderItemsValue.value?.forEach((el) => {
        if (widthBaseline < folderListWidthWithoutMoreButton) {
            const _width = widthBaseline + useElementSize(el).width.value;
            if (_width > folderListWidthWithoutMoreButton) {
                moreState.isShowMoreButton = true;
                return;
            }
            moreState.isShowMoreButton = false;

            widthBaseline += useElementSize(el).width.value;
            _refinedFolderList.push(el);
        }
    });
    if (moreState.isShowMoreButton) {
        _refinedFolderList.pop();
    }
    state.refinedFolderListWidth = sumBy(_refinedFolderList, (cur) => {
        const curWidth = useElementSize(cur)?.width.value ?? 0;
        return curWidth + FOLDER_DEFAULT_GAP;
    }) - 2;
    state.refinedFolderList = bookmarkFolderList?.slice(_refinedFolderList.length) || [];
}, { immediate: true });
watch([() => storeState.isFullMode, () => storeState.isFileFullMode], () => {
    bookmarkStore.setSelectedBookmarks([]);
    moreState.selectedItems = [];
});
watch(() => storeState.bookmarkType, (bookmarkType) => {
    state.selectedToolId = bookmarkType;
    moreState.selectedItems = [];
}, { immediate: true });
watch(() => storeState.filterByFolder, (filterByFolder) => {
    const refinedFilterByFolder = state.refinedFolderList.find((item) => item.name === filterByFolder);
    if (filterByFolder && refinedFilterByFolder) {
        moreState.selectedItems = [{
            ...refinedFilterByFolder,
            name: refinedFilterByFolder.id,
            label: refinedFilterByFolder.name,
        }];
    }
}, { immediate: true });
</script>

<template>
    <div ref="componentRef"
         class="bookmark-header"
         :class="{'full-mode': storeState.isFullMode}"
    >
        <div v-if="storeState.isFullMode && storeState.selectedBookmarks.length > 0"
             class="selected-ids-wrapper"
        >
            <div class="selected-ids">
                <p-icon-button name="ic_close"
                               size="sm"
                               color="inherit"
                               @click="bookmarkStore.setSelectedBookmarks([])"
                />
                <span>{{ $t('HOME.BOOKMARK_SELECTED', {count: storeState.selectedBookmarks.length}) }}</span>
                <p-icon-button name="ic_delete"
                               size="sm"
                               color="inherit"
                               @click="bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.MULTI_DELETE);"
                />
            </div>
        </div>
        <div class="bookmark-header-content">
            <div class="title-wrapper">
                <p-field-title :label="storeState.isFileFullMode ? storeState.filterByFolder : $t('HOME.BOOKMARKS')"
                               size="lg"
                >
                    <template v-if="storeState.isFileFullMode"
                              #left
                    >
                        <p-icon-button name="ic_arrow-left"
                                       style-type="transparent"
                                       size="sm"
                                       @click="handleGoBackButton"
                        />
                        <div v-if="!state.isMobileSize"
                             class="folder-icon-wrapper"
                        >
                            <p-i name="ic_folder-filled"
                                 width="0.875rem"
                                 height="0.875rem"
                                 class="folder"
                            />
                            <p-i v-if="storeState.selectedBookmark?.isGlobal"
                                 name="ic_globe-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 class="global"
                                 :color="gray[600]"
                            />
                        </div>
                    </template>
                    <template v-if="storeState.isFileFullMode
                                  && !state.isMobileSize
                                  && !(state.selectedToolId === BOOKMARK_TYPE.WORKSPACE && storeState.isWorkspaceMember)
                                  && !storeState.selectedBookmark?.isGlobal"
                              #right
                    >
                        <div class="title-right-wrapper">
                            <p-icon-button name="ic_edit-text"
                                           size="sm"
                                           @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.FOLDER, true)"
                            />
                            <p-icon-button name="ic_delete"
                                           size="sm"
                                           @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.DELETE_FOLDER)"
                            />
                        </div>
                    </template>
                </p-field-title>
                <div v-if="!state.isMobileSize"
                     class="create-button-wrapper"
                >
                    <p-button v-if="!storeState.isFileFullMode"
                              icon-left="ic_plus"
                              size="sm"
                              class="add-link-button"
                              style-type="tertiary"
                              @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.FOLDER, false, true)"
                    >
                        <span>{{ $t('HOME.FORM_FOLDER') }}</span>
                    </p-button>
                    <p-button v-if="!storeState.selectedBookmark?.isGlobal"
                              icon-left="ic_plus"
                              size="sm"
                              class="add-link-button"
                              style-type="tertiary"
                              @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.LINK, false, !(storeState.isFileFullMode && !!storeState.selectedBookmark))"
                    >
                        <span>{{ $t('HOME.FORM_LINK') }}</span>
                    </p-button>
                </div>
                <div class="extra-wrapper">
                    <p-select-button-group v-if="!storeState.isFileFullMode"
                                           class="data-source-wrapper"
                                           :buttons="state.tools"
                                           :selected="state.selectedToolId"
                                           @update:selected="handleSelectTool"
                    />
                    <p-icon-button v-if="!storeState.isFullMode && !storeState.isFileFullMode"
                                   name="ic_edit"
                                   size="md"
                                   class="view-all-button"
                                   @click="handleClickFullModeButton"
                    />
                    <p-icon-button v-if="storeState.isFullMode || storeState.isFileFullMode"
                                   name="ic_close"
                                   size="md"
                                   :activated="false"
                                   @click="handleClickFullModeButton"
                    />
                </div>
            </div>
            <div v-if="!storeState.isFullMode && !storeState.isFileFullMode && props.bookmarkFolderList.length > 0"
                 class="bookmark-folders-wrapper"
            >
                <div v-if="props.bookmarkFolderList.length > 0"
                     class="bookmark-folders-container"
                     :style="{ maxWidth: `${state.folderListMaxWidth}px`}"
                >
                    <div class="bookmark-folders"
                         :style="{ maxWidth: `${state.refinedFolderListWidth}px`}"
                    >
                        <p-button v-for="(item, idx) in props.bookmarkFolderList"
                                  ref="folderItemsRef"
                                  :key="idx"
                                  style-type="tertiary"
                                  class="folders-button"
                                  :class="{'active': storeState.filterByFolder === item.name}"
                                  @click="handleClickFolder(item)"
                        >
                            <p-i v-if="storeState.filterByFolder === item.name"
                                 name="ic_close"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <span v-else
                                  class="folder-item-icon-wrapper"
                            >
                                <p-i name="ic_folder"
                                     width="0.875rem"
                                     height="0.875rem"
                                />
                                <p-i v-if="item.isGlobal"
                                     name="ic_globe-filled"
                                     width="0.625rem"
                                     height="0.625rem"
                                     class="global"
                                     :color="gray[600]"
                                />
                            </span>
                            <span>{{ item.name }}</span>
                        </p-button>
                    </div>
                    <div v-if="moreState.isShowMoreButton"
                         class="show-more-wrapper"
                    >
                        <p-button ref="moreButtonRef"
                                  style-type="tertiary"
                                  class="show-more-button"
                                  :class="{'active': visibleContextMenu || moreState.selectedItems.length > 0}"
                                  @click="handleClickAddMore"
                        >
                            <p-i v-if="visibleContextMenu"
                                 name="ic_close"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <p-i v-else
                                 name="ic_ellipsis-horizontal"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <span>{{ $t('HOME.BOOKMARK_MORE') }}</span>
                        </p-button>
                        <p-context-menu v-if="visibleContextMenu"
                                        ref="moreContextMenuRef"
                                        :menu="moreState.menuItems"
                                        :selected="moreState.selectedItems"
                                        :style="{ 'top': `${moreButtonTop + moreButtonHeight}px`} "
                                        show-select-marker
                                        show-clear-selection
                                        class="more-context-menu"
                                        @select="handleSelectAddMoreMenuItem"
                        >
                            <template #header>
                                <p-text-button class="clear-all-wrapper"
                                               style-type="highlight"
                                               size="md"
                                               @click="handleClickAllSelection"
                                >
                                    {{ $t('COMPONENT.CONTEXT_MENU.CLEAR_SELECTION') }}
                                </p-text-button>
                            </template>
                        </p-context-menu>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.bookmark-header {
    @apply flex items-center;
    gap: 0.5rem;
    .selected-ids-wrapper {
        @apply absolute flex items-center justify-center;
        top: 0.75rem;
        left: 50%;
        transform: translate(-50%);
        padding-bottom: 1rem;
        .selected-ids {
            @apply flex items-center bg-gray-100 text-label-md border border-gray-200;
            height: 2.5rem;
            padding: 0.5rem;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
            border-radius: 2rem;
            z-index: 10;
            gap: 0.25rem;
        }
    }
    .bookmark-header-content {
        @apply flex flex-col;
        width: 100%;
        .title-wrapper {
            @apply flex items-center;
            .create-button-wrapper {
                @apply flex;
                margin-left: 0.5rem;
                gap: 0.5rem;
            }
            .extra-wrapper {
                @apply flex items-center;
                margin-left: auto;
                gap: 0.5rem;
                .view-all-button {
                    &:hover {
                        @apply text-secondary;
                    }
                    &:focus {
                        @apply text-gray-900;
                    }
                }
            }
        }
        .bookmark-folders-wrapper {
            @apply flex items-center;
            width: 100%;
            margin-top: 1.375rem;
            .bookmark-folders-container {
                @apply flex items-center overflow-hidden;
                .bookmark-folders {
                    @apply flex overflow-hidden;
                    gap: 0.25rem;
                }
                .folders-button, .show-more-button {
                    @apply flex items-center font-normal text-label-md bg-gray-150;
                    min-width: initial;
                    height: 1.625rem;
                    padding: 0.25rem 0.625rem;
                    border: none;
                    font-family: Noto Sans, Roboto, sans-serif;
                    gap: 0.25rem;
                    &.active {
                        @apply bg-blue-300;
                        &:hover {
                            @apply bg-blue-200;
                        }
                    }
                    &:hover {
                        @apply bg-gray-200;
                    }

                    .folder-item-icon-wrapper {
                        @apply relative;
                        .global {
                            @apply absolute bg-gray-150 rounded-full;
                            right: -0.25rem;
                            bottom: -0.125rem;
                        }
                    }
                }
                .show-more-wrapper {
                    .more-context-menu {
                        z-index: 10;
                    }
                    .clear-all-wrapper {
                        @apply text-label-md;
                        padding: 0.375rem 0.5rem 0.75rem;
                    }
                }
            }
        }
    }

    /* custom design-system component - p-field-title */
    :deep(.p-field-title) {
        .title-wrapper {
            @apply items-center;
            gap: 0.375rem;
            .folder-icon-wrapper {
                @apply relative flex items-center justify-center bg-blue-200 rounded;
                width: 1.5rem;
                height: 1.5rem;
                .global {
                    @apply absolute bg-gray-150 rounded-full;
                    right: -0.125rem;
                    bottom: -0.125rem;
                }
            }
            .title-right-wrapper {
                @apply flex text-gray-900;
            }
        }
    }

    @screen mobile {
        &.full-mode {
            /* custom design-system component - p-field-title */
            :deep(.p-field-title) {
                max-width: calc(100% - 9.375rem);
                .title {
                    @apply truncate;
                }
            }
        }
        &:not(.full-mode) {
            @apply relative flex-col items-start;
        }
    }
}
</style>
