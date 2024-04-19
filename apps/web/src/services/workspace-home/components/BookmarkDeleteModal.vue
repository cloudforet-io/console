<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButtonModal, PI, PLazyImg } from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { gray } from '@/styles/colors';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/services/workspace-home/types/workspace-home-type';

const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const storeState = reactive({
    bookmarkFolderList: computed<BookmarkItem[]|undefined>(() => bookmarkGetters.bookmarkFolderList),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkGetters.selectedBookmark),
    type: computed<BookmarkModalType|undefined>(() => bookmarkGetters.modal.type),
    isFileFullMode: computed<boolean|undefined>(() => bookmarkGetters.isFileFullMode),
});
const state = reactive({
    loading: false,
    isFolder: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_FOLDER),
    isLink: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_LINK),
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        if (state.isFolder) {
            await bookmarkStore.deleteBookmarkFolder(storeState.selectedBookmark?.id);
        } else {
            await bookmarkStore.deleteBookmarkLink(storeState.selectedBookmark?.id);
        }
        if (storeState.isFileFullMode) {
            if (state.isFolder) {
                bookmarkStore.setFullMode(true);
                bookmarkStore.setSelectedBookmark(undefined);
            } else {
                const folder = storeState.bookmarkFolderList?.find((i) => i.id === storeState.selectedBookmark?.folder);
                bookmarkStore.setSelectedBookmark(folder);
            }
        }
        await handleClose();
    } finally {
        state.loading = false;
    }
};
const handleClose = () => {
    bookmarkStore.setModalType(undefined);
};
</script>

<template>
    <p-button-modal class="bookmark-delete-modal"
                    :header-title="state.isFolder ? $t('HOME.BOOKMARK_DELETE_FOLDER_TITLE') :$t('HOME.BOOKMARK_DELETE_LINK_TITLE')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.isFolder || state.isLink"
                    theme-color="alert"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @close="handleClose"
                    @cancel="handleClose"
    >
        <template #body>
            <div class="content-wrapper">
                <div class="icon-wrapper"
                     :class="{'is-folder': state.isFolder}"
                >
                    <p-i v-if="state.isFolder"
                         name="ic_folder-filled"
                         width="0.875rem"
                         height="0.875rem"
                    />
                    <p-lazy-img
                        v-else
                        :src="assetUrlConverter(storeState.selectedBookmark?.imgIcon)"
                        width="1.5rem"
                        height="1.5rem"
                        error-icon="ic_globe-filled"
                        :error-icon-color="gray[500]"
                        class="icon"
                    />
                </div>
                <span>{{ storeState.selectedBookmark?.name }}</span>
            </div>
        </template>
        <template #confirm-button>
            <span>{{ $t('HOME.BOOKMARK_DELETE') }}</span>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.bookmark-delete-modal {
    .content-wrapper {
        @apply flex items-center bg-gray-100 border border-gray-200 rounded-xl;
        padding: 0.5rem;
        gap: 0.5rem;
        .icon-wrapper {
            @apply flex items-center justify-center rounded-xl;
            width: 2.5rem;
            height: 2.5rem;
            &.is-folder {
                @apply bg-blue-200;
            }
        }
    }
}
</style>
