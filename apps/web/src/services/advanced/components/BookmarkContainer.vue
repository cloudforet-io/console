<script setup lang="ts">
import {
    computed, onUnmounted, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import BookmarkDeleteModal from '@/common/components/bookmark/BookmarkDeleteModal.vue';
import BookmarkFolderFormModal from '@/common/components/bookmark/BookmarkFolderFormModal.vue';
import BookmarkLinkFormModal from '@/common/components/bookmark/BookmarkLinkFormModal.vue';
import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';

import { useBookmarkFolderListQuery } from '@/services/advanced/composables/use-bookmark-forder-list-query';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
    selectedType: computed<string>(() => bookmarkPageState.selectedType),
    isTableItem: computed<boolean>(() => bookmarkPageState.isTableItem),
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
});
const state = reactive({
    globalFolderList: computed<BookmarkItem[]>(() => bookmarkFolderListData.value.filter((item) => item.isGlobal)),
});

const { bookmarkFolderListData } = useBookmarkFolderListQuery();

const handleCreateFolder = async (isEdit?: boolean, name?: string) => {
    if (isEdit && name) {
        if (!storeState.isTableItem) {
            await router.push({
                name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME,
                params: {
                    group: route.params.group,
                    folder: name,
                },
            });
        }
        bookmarkPageStore.setIsTableItem(false);
    }
};
const handleCreateLink = (selectedFolder?: BookmarkItem) => {
    if (route.params.folder) {
        if (!selectedFolder) {
            router.push({
                name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.GROUP._NAME,
                params: {
                    group: route.params.group,
                },
            });
        }
        bookmarkPageStore.setIsTableItem(false);
    }
};
const handleConfirmDelete = (isFolder?: boolean) => {
    if (route.params.folder) {
        if (isFolder && !storeState.isTableItem) {
            router.push({
                name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.GROUP._NAME,
                params: {
                    group: route.params.group,
                },
            });
        }
        bookmarkPageStore.setIsTableItem(false);
    }
    bookmarkPageStore.setSelectedBookmarkIndices([]);
};

onUnmounted(() => {
    bookmarkPageStore.resetState();
    bookmarkStore.resetState();
});
</script>

<template>
    <div class="bookmark-container">
        <router-view />
        <bookmark-folder-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.FOLDER"
                                    :bookmark-folder-list="state.globalFolderList"
                                    :selected-bookmark="storeState.selectedBookmark"
                                    @confirm="handleCreateFolder"
        />
        <bookmark-link-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.LINK"
                                  @confirm="handleCreateLink"
        />
        <bookmark-delete-modal
            v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_FOLDER
                || storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_LINK
                || storeState.modalType === BOOKMARK_MODAL_TYPE.MULTI_DELETE"
            @confirm="handleConfirmDelete"
        />
    </div>
</template>
