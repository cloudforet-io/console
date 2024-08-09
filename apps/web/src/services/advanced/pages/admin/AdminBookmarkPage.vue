<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { at } from 'lodash';

import { PHeading, PButton, PContextMenu } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/inputs/context-menu/type';

import { i18n } from '@/translations';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';

import BookmarkManagementTable from '@/services/advanced/components/BookmarkManagementTable.vue';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;

const storeState = reactive({
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),

    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
    selectedIndices: computed<number[]>(() => bookmarkPageGetters.selectedIndices),
});
const state = reactive({
    visibleMenu: false,
    createMenu: computed<MenuItem[]>(() => ([
        {
            label: i18n.t('IAM.BOOKMARK.ADD_LINK'),
            name: BOOKMARK_MODAL_TYPE.LINK,
        },
        {
            label: i18n.t('IAM.BOOKMARK.CREATE_FOLDER'),
            name: BOOKMARK_MODAL_TYPE.FOLDER,
        },
    ])),
});

const handleClickCreateButton = () => {
    state.visibleMenu = !state.visibleMenu;
};
const handleSelectMenuItem = (value: MenuItem) => {
    if (value.name === BOOKMARK_MODAL_TYPE.LINK) {
        bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK);
    } else if (value.name === BOOKMARK_MODAL_TYPE.FOLDER) {
        bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.FOLDER);
    }
    state.visibleMenu = false;
};
const handleClickDeleteButton = () => {
    const selectedItems = at(storeState.bookmarkList, storeState.selectedIndices);
    bookmarkStore.setSelectedBookmarks(selectedItems);
    bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.MULTI_DELETE);
};
</script>

<template>
    <div class="admin-bookmark-page">
        <p-heading :title="$t('IAM.BOOKMARK.ALL_BOOKMARK')"
                   class="title"
        >
            <template #extra>
                <div class="extra">
                    <p-button style-type="tertiary"
                              icon-left="ic_delete"
                              :disabled="storeState.selectedIndices.length === 0"
                              @click="handleClickDeleteButton"
                    >
                        {{ $t('IAM.BOOKMARK.DELETE') }} {{ storeState.selectedIndices.length || ' ' }}
                    </p-button>
                    <div class="create-button-wrapper">
                        <p-button icon-left="ic_plus"
                                  @click="handleClickCreateButton"
                        >
                            {{ $t('IAM.BOOKMARK.ADD_GLOBAL_BOOKMARK') }}
                        </p-button>
                        <p-context-menu v-show="state.visibleMenu"
                                        class="create-context-menu"
                                        reset-selected-on-unmounted
                                        :selected="[]"
                                        :menu="state.createMenu"
                                        @select="handleSelectMenuItem"
                        />
                    </div>
                </div>
            </template>
        </p-heading>
        <bookmark-management-table />
    </div>
</template>

<style lang="postcss" scoped>
.admin-bookmark-page {
    .title {
        .extra {
            @apply flex;
            gap: 1rem;
            .create-button-wrapper {
                @apply relative;
                .create-context-menu {
                    @apply absolute;
                    min-width: unset;
                    width: 9rem;
                    top: 2rem;
                    right: 0;
                    z-index: 10;
                }
            }
        }
    }
}
</style>
