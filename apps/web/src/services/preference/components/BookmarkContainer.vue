<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
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
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
});
const handleCreateFolder = (isEdit?: boolean, name?: string) => {
    if (isEdit && name) {
        router.push({
            name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME),
            params: {
                group: route.params.group,
                folder: name,
            },
        });
    } else {
        bookmarkPageStore.fetchBookmarkList();
    }
    bookmarkPageStore.fetchBookmarkFolderList();
};
const handleConfirmDelete = () => {
    if (route.params.folder) {
        router.push({
            name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.GROUP._NAME),
            params: {
                group: route.params.group,
            },
        });
        bookmarkPageStore.fetchBookmarkFolderList();
        return;
    }
    bookmarkPageStore.fetchBookmarkFolderList();
    bookmarkPageStore.fetchBookmarkList(storeState.selectedType);
    bookmarkPageStore.setSelectedBookmarkIndices([]);
};

watch(() => route.params, () => {
    bookmarkPageStore.setParams(route.params);
}, { immediate: true });

onUnmounted(() => {
    bookmarkPageStore.resetState();
});

onMounted(() => {
    bookmarkPageStore.fetchBookmarkFolderList();
});
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
        <bookmark-delete-modal
            v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_FOLDER
                || storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_LINK
                || storeState.modalType === BOOKMARK_MODAL_TYPE.MULTI_DELETE"
            @confirm="handleConfirmDelete"
        />
    </div>
</template>
