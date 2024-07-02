<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import BookmarkDeleteModal from '@/common/components/bookmark/BookmarkDeleteModal.vue';
import BookmarkFolderFormModal from '@/common/components/bookmark/BookmarkFolderFormModal.vue';
import BookmarkLinkFormModal from '@/common/components/bookmark/BookmarkLinkFormModal.vue';
import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';


const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    selectedType: computed<string>(() => bookmarkPageState.selectedType),
    isTableItem: computed<boolean>(() => bookmarkPageState.isTableItem),
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
});
const state = reactive({
    globalFolderList: computed<BookmarkItem[]>(() => storeState.bookmarkFolderList.filter((item) => item.isGlobal)),
});

const handleCreateFolder = (isEdit?: boolean, name?: string) => {
    if (isEdit && name) {
        if (!storeState.isTableItem) {
            router.push({
                name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME),
                params: {
                    group: route.params.group,
                    folder: name,
                },
            });
        }
        bookmarkPageStore.setIsTableItem(false);
    }
    bookmarkPageStore.fetchBookmarkList();
    bookmarkPageStore.fetchBookmarkFolderList();
};
const handleConfirmDelete = () => {
    if (route.params.folder) {
        if (!storeState.isTableItem) {
            router.push({
                name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.GROUP._NAME),
                params: {
                    group: route.params.group,
                },
            });
        }
        bookmarkPageStore.setIsTableItem(false);
    }
    bookmarkPageStore.fetchBookmarkFolderList();
    bookmarkPageStore.fetchBookmarkList(storeState.selectedType);
    bookmarkPageStore.setSelectedBookmarkIndices([]);
};

onUnmounted(() => {
    bookmarkPageStore.resetState();
    bookmarkStore.resetState();
});

onMounted(() => {
    bookmarkPageStore.fetchBookmarkFolderList();
});
</script>

<template>
    <div class="admin-bookmark-page">
        <router-view />
        <bookmark-folder-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.FOLDER"
                                    :bookmark-folder-list="state.globalFolderList"
                                    @confirm="handleCreateFolder"
        />
        <bookmark-link-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.LINK"
                                  :bookmark-folder-list="state.globalFolderList"
                                  @confirm="bookmarkPageStore.fetchBookmarkList()"
        />
        <bookmark-delete-modal
            v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_FOLDER
                || storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_LINK
                || storeState.modalType === BOOKMARK_MODAL_TYPE.MULTI_DELETE"
            @confirm="handleConfirmDelete"
        />
    </div>
</template>
