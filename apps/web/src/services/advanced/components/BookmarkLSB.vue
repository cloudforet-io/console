<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PTextInput, PTextHighlighting, PEmpty,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { gray } from '@/styles/colors';

import BookmarkTree from '@/services/advanced/components/BookmarkTree.vue';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;

const route = useRoute();

const storeState = reactive({
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
});

const state = reactive({
    bookmarkKeyword: '',
    currentPath: computed(() => route.fullPath),
    menuSet: computed<LSBItem[]>(() => [
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('IAM.BOOKMARK.ALL_BOOKMARK'),
            icon: 'ic_dots-4-square',
            to: { name: ADMIN_ADVANCED_ROUTE.BOOKMARK._NAME },
            hideFavorite: true,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t('MENU.ADMINISTRATION_BOOKMARK'),
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: 'search',
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            id: 'bookmark',
        },
    ]),
    bookmarkFilteredByKeyword: computed<LSBItem[]>(() => storeState.bookmarkFolderList.filter((folder) => (folder.name as string)?.includes(state.bookmarkKeyword))
        .map((folder) => ({
            type: MENU_ITEM_TYPE.ITEM,
            label: folder.name,
            id: folder.id,
            icon: { name: 'ic_folder', color: gray[900] },
            to: {
                name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME,
                params: {
                    group: folder.workspaceId || 'global',
                    folder: folder.name as string || '',
                },
            },
        }))),
});
</script>

<template>
    <l-s-b class="bookmark-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #slot-search>
            <p-text-input v-model="state.bookmarkKeyword"
                          class="bookmark-search"
                          :placeholder="$t('HOME.BOOKMARK_SEARCH')"
            />
        </template>
        <template #slot-bookmark>
            <template v-if="state.bookmarkKeyword">
                <div class="router-menu-wrapper">
                    <l-s-b-router-menu-item v-for="(_item, idx) of state.bookmarkFilteredByKeyword"
                                            :key="idx"
                                            :item="_item"
                                            :idx="`search-${idx}`"
                                            :current-path="state.currentPath"
                                            is-hide-favorite
                    >
                        <p-text-highlighting class="search-result-text"
                                             :term="state.bookmarkKeyword"
                                             :text="_item.label"
                        />
                    </l-s-b-router-menu-item>
                </div>
                <p-empty v-if="state.bookmarkKeyword && !state.bookmarkFilteredByKeyword.length"
                         class="search-empty"
                >
                    <span>
                        {{ $t('PROJECT.LANDING.SEARCH_EMPTY_TEXT') }}
                    </span>
                </p-empty>
            </template>
            <bookmark-tree v-else />
        </template>
    </l-s-b>
</template>

<style scoped lang="postcss">
.bookmark-l-s-b {
    .bookmark-search {
        @apply w-full;
    }
    .search-result-text {
        @apply overflow-hidden whitespace-nowrap;
        text-overflow: ellipsis;
    }
    .search-empty {
        @apply text-paragraph-md;
        white-space: pre;
        margin-top: 0.75rem;
        margin-left: auto;
        margin-right: auto;
    }
    .router-menu-wrapper {
        @apply flex flex-col;
    }
}
</style>
