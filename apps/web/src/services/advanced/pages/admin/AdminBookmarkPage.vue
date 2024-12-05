<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { at, clone } from 'lodash';

import {
    PHeading, PButton, PContextMenu, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/src/controls/context-menu/type';

import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkModalType, BookmarkItem } from '@/common/components/bookmark/type/type';

import BookmarkManagementTable from '@/services/advanced/components/BookmarkManagementTable.vue';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;
const userStore = useUserStore();

const route = useRoute();

const storeState = reactive({
    modalType: computed<BookmarkModalType|undefined>(() => bookmarkState.modal.type),

    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
    selectedIndices: computed<number[]>(() => bookmarkPageGetters.selectedIndices),
    pageAccessPermissionMap: computed<PageAccessMap>(() => userStore.getters.pageAccessPermissionMap),
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
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
});

const hideMenu = () => {
    state.visibleMenu = false;
};
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
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.BOOKMARK.ALL_BOOKMARK')" />
            </template>
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="tertiary"
                          icon-left="ic_delete"
                          :disabled="storeState.selectedIndices.length === 0"
                          @click="handleClickDeleteButton"
                >
                    {{ $t('IAM.BOOKMARK.DELETE') }} {{ storeState.selectedIndices.length || ' ' }}
                </p-button>
                <div v-on-click-outside="hideMenu"
                     class="create-button-wrapper"
                >
                    <p-button icon-left="ic_plus"
                              class="create-button"
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
            </template>
        </p-heading-layout>
        <bookmark-management-table :has-read-write-access="state.hasReadWriteAccess" />
    </div>
</template>

<style lang="postcss" scoped>
.admin-bookmark-page {
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
</style>
