<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import BookmarkFolderFormModal from '@/common/components/bookmark/BookmarkFolderFormModal.vue';
import BookmarkLinkFormModal from '@/common/components/bookmark/BookmarkLinkFormModal.vue';
import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';

import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;

const storeState = reactive({
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
});

const handleCreateFolder = () => {
    bookmarkPageStore.fetchBookmarkFolderList();
    bookmarkPageStore.fetchBookmarkList();
};
</script>

<template>
    <div class="admin-bookmark-page">
        <router-view />
        <bookmark-folder-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.FOLDER"
                                    :bookmark-folder-list="storeState.bookmarkFolderList"
                                    @confirm="handleCreateFolder"
        />
        <bookmark-link-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.LINK"
                                  :bookmark-folder-list="storeState.bookmarkFolderList"
                                  @confirm="bookmarkPageStore.fetchBookmarkList()"
        />
    </div>
</template>
