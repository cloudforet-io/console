<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButtonModal, PI } from '@spaceone/design-system';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkModalType } from '@/services/workspace-home/types/workspace-home-type';

const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const storeState = reactive({
    activeFolderName: computed<string|undefined>(() => bookmarkGetters.activeFolderName),
    type: computed<BookmarkModalType|undefined>(() => bookmarkGetters.modalType),
});
const state = reactive({
    loading: false,
    isFolder: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_FOLDER),
    isLink: computed<boolean>(() => storeState.type === BOOKMARK_MODAL_TYPE.DELETE_LINK),
});

const handleConfirm = () => {};
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
                </div>
                <span>{{ state.isFolder ? storeState.activeFolderName : '' }}</span>
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
