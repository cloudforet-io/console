<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import BookmarkDeleteModal from '@/common/components/bookmark/BookmarkDeleteModal.vue';
import BookmarkFolderFormModal from '@/common/components/bookmark/BookmarkFolderFormModal.vue';
import BookmarkLinkFormModal from '@/common/components/bookmark/BookmarkLinkFormModal.vue';
import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),

    workspaceList: computed<WorkspaceModel[]>(() => bookmarkPageState.workspaceList),
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
    selectedType: computed<string>(() => bookmarkPageState.selectedType),
    isTableItem: computed<boolean>(() => bookmarkPageState.isTableItem),
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
});
const state = reactive({
    globalFolderList: computed<BookmarkItem[]>(() => storeState.bookmarkFolderList.filter((item) => item.isGlobal)),
});

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
    await bookmarkPageStore.fetchBookmarkFolderList();
    await bookmarkPageStore.fetchBookmarkList();
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
    bookmarkPageStore.fetchBookmarkList();
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
    bookmarkPageStore.fetchBookmarkFolderList();
    bookmarkPageStore.fetchBookmarkList(storeState.selectedType);
    bookmarkPageStore.setSelectedBookmarkIndices([]);
};

watch(() => storeState.workspaceList, () => {
    bookmarkPageStore.fetchBookmarkFolderList();
});

onUnmounted(() => {
    bookmarkPageStore.resetState();
    bookmarkStore.resetState();
});

onMounted(() => {
    bookmarkPageStore.fetchWorkspaceList();
});
</script>

<template>
    <div class="bookmark-container">
        <router-view />
        <bookmark-folder-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.FOLDER"
                                    :bookmark-folder-list="state.globalFolderList"
                                    :bookmark-list="storeState.bookmarkList"
                                    :selected-bookmark="storeState.selectedBookmark"
                                    @confirm="handleCreateFolder"
        />
        <bookmark-link-form-modal v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.LINK"
                                  :bookmark-folder-list="state.globalFolderList"
                                  @confirm="handleCreateLink"
        />
        <bookmark-delete-modal
            v-if="storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_FOLDER
                || storeState.modalType === BOOKMARK_MODAL_TYPE.DELETE_LINK
                || storeState.modalType === BOOKMARK_MODAL_TYPE.MULTI_DELETE"
            :bookmark-list="storeState.bookmarkList"
            @confirm="handleConfirmDelete"
        />
    </div>
</template>
