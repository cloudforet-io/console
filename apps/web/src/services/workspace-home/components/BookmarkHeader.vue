<script setup lang="ts">
import { useElementBounding, useElementSize } from '@vueuse/core';
import { useWindowSize } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PDivider, PFieldTitle, PI, PIconButton, PTextButton, screens, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import { CONTEXT_MENU_TYPE } from '@spaceone/design-system/src/inputs/context-menu/type';
import { sumBy } from 'lodash';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType, MoreMenuItem } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;

const { width } = useWindowSize();

const componentRef = ref<HTMLElement|null>(null);
const toolboxRef = ref<HTMLElement|null>(null);
const folderItemsRef = ref<HTMLElement[]|null>(null);

const moreButtonRef = ref<HTMLElement | null>(null);
const moreContextMenuRef = ref<any|null>(null);

const { width: containerWidth } = useElementSize(componentRef);
const { width: toolboxWidth } = useElementSize(toolboxRef);
const { top: moreButtonTop, height: moreButtonHeight } = useElementBounding(moreButtonRef);

const storeState = reactive({
    filterByFolder: computed<string|undefined|TranslateResult>(() => bookmarkState.filterByFolder),
    isFullMode: computed<boolean>(() => bookmarkState.isFullMode),
    isFileFullMode: computed<boolean>(() => bookmarkState.isFileFullMode),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    folderListMaxWidth: computed<number>(() => containerWidth.value - 150 - toolboxWidth.value),

    refinedFolderList: [] as BookmarkItem[],
    refinedFolderListWidth: 0,
});
const moreState = reactive({
    isShowMoreButton: false,
    menuItems: computed<MoreMenuItem[]>(() => state.refinedFolderList.map((i) => ({
        ...i,
        name: i.id,
        label: i.name,
        type: CONTEXT_MENU_TYPE.item,
    }))),
    selectedItems: [] as MoreMenuItem[],
});

const {
    visibleMenu: visibleContextMenu,
    contextMenuStyle,
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
    bookmarkStore.setFullMode(!storeState.isFullMode);
};
const handleClickActionButton = (type: BookmarkModalType, isEdit?: boolean, isNew?: boolean) => {
    bookmarkStore.setModalType(type, isEdit, isNew);
};
const handleClickFolder = (item: BookmarkItem) => {
    if (storeState.filterByFolder === item.name) {
        bookmarkStore.setSelectedBookmark(undefined);
        return;
    }
    bookmarkStore.setSelectedBookmark(item);
};
const handleGoBackButton = () => {
    bookmarkStore.setFileFullMode(false);
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
    });
    hideContextMenu();
};

watch([() => folderItemsRef.value, () => state.folderListMaxWidth, () => props.bookmarkFolderList], ([folderItemsValue, folderListMaxWidth, bookmarkFolderList]) => {
    if (!folderItemsValue) return;
    const folderListWidthWithoutMoreButton = folderListMaxWidth - 124;
    const _refinedFolderList: HTMLElement[] = [];
    let widthBaseline = 0;
    folderItemsValue.forEach((el) => {
        if (widthBaseline < folderListWidthWithoutMoreButton) {
            const _width = widthBaseline + useElementSize(el).width.value;
            if (_width > folderListWidthWithoutMoreButton) {
                moreState.isShowMoreButton = true;
                return;
            }
            widthBaseline += useElementSize(el).width.value;
            _refinedFolderList.push(el);
        }
    });
    _refinedFolderList.pop();
    state.refinedFolderListWidth = sumBy(_refinedFolderList, (cur) => {
        const curWidth = useElementSize(cur)?.width.value ?? 0;
        return curWidth + 4;
    });
    state.refinedFolderList = bookmarkFolderList?.slice(_refinedFolderList.length);
});
</script>

<template>
    <div ref="componentRef"
         class="bookmark-header"
         :class="{'full-mode': storeState.isFullMode}"
    >
        <p-field-title :label="storeState.isFileFullMode ? storeState.filterByFolder : $t('HOME.BOOKMARK_TITLE')"
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
                <div class="folder-icon-wrapper">
                    <p-i name="ic_folder-filled"
                         width="0.875rem"
                         height="0.875rem"
                    />
                </div>
            </template>
            <template v-if="storeState.isFileFullMode"
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
        <div v-if="!storeState.isFullMode"
             class="bookmark-folders-wrapper"
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
                    <p-i v-else
                         name="ic_folder"
                         width="0.875rem"
                         height="0.875rem"
                    />
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
                                :style="{ ...contextMenuStyle, 'top': `${moreButtonTop + moreButtonHeight}px`} "
                                show-select-marker
                                class="more-context-menu"
                                @select="handleSelectAddMoreMenuItem"
                />
            </div>
        </div>
        <div v-if="!storeState.isFileFullMode && !state.isMobileSize"
             class="file-extra-wrapper"
        >
            <p-divider vertical
                       class="divider"
            />
            <div>
                <p-icon-button v-if="props.bookmarkFolderList.length > 0"
                               name="ic_plus"
                               style-type="tertiary"
                               shape="square"
                               size="sm"
                               @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.FOLDER)"
                />
                <p-text-button v-else
                               icon-left="ic_plus"
                               class="create-folder-button"
                               @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.FOLDER)"
                >
                    {{ $t('HOME.BOOKMARK_CREATE_FOLDER') }}
                </p-text-button>
            </div>
        </div>
        <div ref="toolboxRef"
             class="toolbox-wrapper"
        >
            <p-button v-if="!state.isMobileSize || (state.isMobileSize && storeState.isFullMode)"
                      icon-left="ic_plus"
                      class="add-link-button"
                      :style-type="storeState.isFullMode ? 'substitutive' : 'tertiary'"
                      @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.LINK, false, true)"
            >
                <span>{{ $t('HOME.BOOKMARK_ADD_LINK') }}</span>
            </p-button>
            <p-icon-button v-if="!state.isMobileSize && !storeState.isFullMode"
                           name="ic_chevron-down"
                           shape="square"
                           size="md"
                           :activated="false"
                           @click="handleClickFullModeButton"
            />
            <p-icon-button v-else-if="storeState.isFullMode"
                           name="ic_close"
                           shape="square"
                           size="md"
                           :activated="false"
                           @click="handleClickFullModeButton"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.bookmark-header {
    @apply flex items-center;
    gap: 0.5rem;
    .bookmark-folders-wrapper {
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
        }
        .show-more-wrapper {
            .more-context-menu {
                z-index: 10;
            }
        }
    }
    .file-extra-wrapper {
        @apply flex;
        margin-left: 0.125rem;
        gap: 0.625rem;
        .divider {
            height: 1.25rem;
        }
        .create-folder-button {
            padding-left: 0;
        }
    }
    .toolbox-wrapper {
        @apply flex;
        margin-left: auto;
        gap: 0.5rem;
        .add-link-button {
            @apply text-label-md;
        }
    }

    /* custom design-system component - p-field-title */
    :deep(.p-field-title) {
        .title-wrapper {
            @apply items-center;
            gap: 0.375rem;
            .folder-icon-wrapper {
                @apply flex items-center justify-center bg-blue-200 rounded;
                width: 1.5rem;
                height: 1.5rem;
            }
            .title-right-wrapper {
                @apply flex text-gray-900;
            }
        }
    }

    @screen mobile {
        &:not(.full-mode) {
            @apply flex-col items-start;
        }
    }
}
</style>
