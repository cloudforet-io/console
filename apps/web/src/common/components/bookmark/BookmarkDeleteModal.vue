<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButtonModal, PI, PLazyImg } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';


import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/common/components/bookmark/type/type';

import { gray } from '@/styles/colors';


const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;

const storeState = reactive({
    bookmarkFolderList: computed<BookmarkItem[]|undefined>(() => bookmarkState.bookmarkFolderData),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    type: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
    isFileFullMode: computed<boolean|undefined>(() => bookmarkState.isFileFullMode),
    selectedBookmarks: computed<BookmarkItem[]>(() => bookmarkState.selectedBookmarks),
});
const state = reactive({
    loading: false,
    isFolder: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_FOLDER),
    isLink: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_LINK),
    isMulti: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.MULTI_DELETE),
    headerTitle: computed<TranslateResult>(() => {
        let title: TranslateResult = '';
        if (state.isFolder) {
            title = i18n.t('HOME.BOOKMARK_DELETE_FOLDER_TITLE');
        } else if (state.isLink) {
            title = i18n.t('HOME.BOOKMARK_DELETE_LINK_TITLE');
        } else if (state.isMulti) {
            title = i18n.t('HOME.BOOKMARK_DELETE_MULTI_ITEMS');
        }
        return title;
    }),
    items: computed<BookmarkItem[]>(() => {
        if (state.isFolder || state.isLink) {
            return [storeState.selectedBookmark] as BookmarkItem[];
        }
        return storeState.selectedBookmarks;
    }),
});

const deleteFolder = async (id?: string) => {
    await bookmarkStore.deleteBookmarkFolder(id);
};
const deleteLink = async (id?: string) => {
    await bookmarkStore.deleteBookmarkLink(id);
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        if (state.isFolder) {
            await deleteFolder(storeState.selectedBookmark?.id);
            if (storeState.isFileFullMode) {
                bookmarkStore.setFullMode(true);
                bookmarkStore.setSelectedBookmark(undefined);
            }
        } else if (state.isLink) {
            await deleteLink(storeState.selectedBookmark?.id);
            if (storeState.isFileFullMode) {
                const folder = storeState.bookmarkFolderList?.find((i) => i.id === storeState.selectedBookmark?.folder);
                bookmarkStore.setSelectedBookmark(folder);
            }
        } else {
            const promises = storeState.selectedBookmarks.map(async (item) => {
                if (item.link) {
                    return deleteLink(item.id);
                }
                return deleteFolder(item.id);
            });
            await Promise.all(promises);
            bookmarkStore.setSelectedBookmarks([]);
        }

        await handleClose();
    } finally {
        state.loading = false;
    }
};
const handleClose = () => {
    bookmarkStore.setModalType(undefined, false, false);
};
</script>

<template>
    <p-button-modal class="bookmark-delete-modal"
                    :header-title="state.headerTitle"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.isFolder || state.isLink || state.isMulti"
                    theme-color="alert"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @close="handleClose"
                    @cancel="handleClose"
    >
        <template #body>
            <div class="content">
                <div v-for="(item, idx) in state.items"
                     :key="`delete-item-${idx}`"
                     class="content-wrapper"
                >
                    <div class="icon-wrapper"
                         :class="{'is-folder': !item.link}"
                    >
                        <p-i v-if="!item.link"
                             name="ic_folder"
                             width="1.25rem"
                             height="1.25rem"
                        />
                        <p-lazy-img
                            v-else
                            :src="assetUrlConverter(item?.imgIcon)"
                            width="1.5rem"
                            height="1.5rem"
                            error-icon="ic_globe-filled"
                            :error-icon-color="gray[500]"
                            class="icon"
                        />
                    </div>
                    <div class="text-wrapper">
                        <span>{{ item?.name }}</span>
                        <span v-if="item.link"
                              class="link"
                        >{{ item.link }}</span>
                    </div>
                </div>
            </div>
        </template>
        <template #confirm-button>
            <span>{{ $t('HOME.BOOKMARK_DELETE') }}</span>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.bookmark-delete-modal {
    .content {
        @apply overflow-y-auto;
        max-height: 16rem;
        .content-wrapper {
            @apply flex items-center bg-gray-100 rounded-xl;
            padding: 0.5rem;
            gap: 0.5rem;
            .icon-wrapper {
                @apply relative flex items-center justify-center rounded-xl;
                width: 2.5rem;
                min-width: 2.5rem;
                height: 2.5rem;
                &.is-folder {
                    @apply bg-blue-200;
                }
            }
            .text-wrapper {
                @apply flex flex-col text-label-md;
                .link {
                    @apply text-label-sm text-gray-500;
                }
            }
            & + .content-wrapper {
                margin-top: 0.25rem;
            }
        }
    }
}
</style>
