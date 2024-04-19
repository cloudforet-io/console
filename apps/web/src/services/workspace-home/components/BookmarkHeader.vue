<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PDivider, PFieldTitle, PIconButton, PTextButton, PI,
} from '@spaceone/design-system';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const storeState = reactive({
    filterByFolder: computed<string|undefined>(() => bookmarkGetters.filterByFolder),
    isFullMode: computed<boolean>(() => bookmarkGetters.isFullMode),
    isFileFullMode: computed<boolean>(() => bookmarkGetters.isFileFullMode),
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
</script>

<template>
    <div class="bookmark-header">
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
        >
            <div class="bookmark-folders">
                <p-button v-for="(item, idx) in props.bookmarkFolderList"
                          :key="idx"
                          style-type="tertiary"
                          class="folders-button"
                          :class="{'active': storeState.filterByFolder === item.name}"
                          @click="handleClickFolder(item)"
                >
                    <p-icon-button v-if="storeState.filterByFolder === item.name"
                                   name="ic_close"
                                   style-type="transparent"
                                   size="sm"
                                   @click.stop="handleClickActionButton(BOOKMARK_MODAL_TYPE.DELETE_FOLDER)"
                    />
                    <p-i v-else
                         name="ic_folder-filled"
                         width="0.875rem"
                         height="0.875rem"
                    />
                    <span>{{ item.name }}</span>
                </p-button>
            </div>
            <p-divider vertical
                       class="divider"
            />
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
        <div class="toolbox-wrapper">
            <p-button icon-left="ic_plus"
                      :style-type="!storeState.isFullMode ? 'tertiary' : 'substitutive'"
                      @click="handleClickActionButton(BOOKMARK_MODAL_TYPE.LINK, false, true)"
            >
                {{ $t('HOME.BOOKMARK_ADD_LINK') }}
            </p-button>
            <p-icon-button v-if="!storeState.isFullMode"
                           name="ic_chevron-down"
                           shape="square"
                           size="md"
                           :activated="false"
                           @click="handleClickFullModeButton"
            />
            <p-icon-button v-else
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
    padding-bottom: 1rem;
    gap: 0.5rem;
    .bookmark-folders-wrapper {
        @apply flex items-center;
        margin-left: 0.25rem;
        gap: 0.75rem;
        flex: 1;
        .bookmark-folders {
            @apply flex;
            gap: 0.25rem;
            .folders-button {
                @apply flex items-center font-normal text-label-md bg-gray-150;
                min-width: initial;
                height: 1.625rem;
                padding: 0.25rem 0.625rem;
                border: none;
                gap: 0.25rem;
                &.active {
                    @apply bg-blue-300;
                }
            }
        }
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
}
</style>
