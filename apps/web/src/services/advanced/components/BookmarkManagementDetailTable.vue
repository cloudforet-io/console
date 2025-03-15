<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PToolboxTable, PLazyImg, PI, PDataLoader, PSelectStatus, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type {
    KeyItemSet,
    ValueHandlerMap,
    ValueItem,
} from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { i18n } from '@/translations';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { gray } from '@/styles/colors';

import { makeSearchQueryTagsHandler, makeValueHandler } from '@/services/advanced/composables/bookmark-data-helper';
import { BOOKMARK_TYPE, PageSizeOptions } from '@/services/advanced/constants/bookmark-constant';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';

const bookmarkStore = useBookmarkStore();
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;

const { hasReadWriteAccess } = usePageEditableStatus();

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
    entireBookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.entireBookmarkList),
    selectedIndices: computed<number[]>(() => bookmarkPageState.selectedIndices),
    pageStart: computed<number>(() => bookmarkPageState.pageStart),
    pageLimit: computed<number>(() => bookmarkPageState.pageLimit),
    loading: computed<boolean>(() => bookmarkPageState.loading),
    selectedType: computed<string>(() => bookmarkPageState.selectedType),
    searchFilter: computed<ConsoleFilter[]>(() => bookmarkPageState.searchFilter),
});
const state = reactive({
    group: computed<string>(() => route.params.group),
    folder: computed<string>(() => route.params.folder),
});
const tableState = reactive({
    fields: computed(() => [
        {
            name: 'name',
            label: 'Name',
            type: 'item',
        },
        {
            name: 'link',
            label: 'Link',
            type: 'item',
            sortable: false,
        },
        {
            name: 'action_button',
            label: ' ',
            width: '2rem',
            sortable: false,
        },
    ]),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'link', label: 'Link' },
        ],
    }]),
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        name: makeValueHandler(storeState.entireBookmarkList, 'name'),
        link: makeValueHandler(storeState.entireBookmarkList, 'link'),
    })),
    typeField: computed<ValueItem[]>(() => ([
        { label: i18n.t('IAM.BOOKMARK.ALL') as string, name: 'All' },
        { label: i18n.t('IAM.BOOKMARK.LINK') as string, name: BOOKMARK_TYPE.LINK },
        { label: i18n.t('IAM.BOOKMARK.FOLDER') as string, name: BOOKMARK_TYPE.FOLDER },
    ])),
});

const getDropdownMenu = (item: BookmarkItem) => {
    const defaultSets: MenuItem[] = [
        {
            icon: 'ic_edit',
            name: 'edit',
            label: i18n.t('HOME.BOOKMARK_EDIT'),
        },
        {
            icon: 'ic_delete',
            name: 'delete',
            label: i18n.t('HOME.BOOKMARK_DELETE'),
        },
    ];
    if (!item.link) {
        return [
            {
                icon: 'ic_plus',
                name: 'add',
                label: i18n.t('HOME.BOOKMARK_ADD_LINK'),
            },
            { type: 'divider' },
            ...defaultSets,
        ];
    }
    return defaultSets;
};
const handleSelectType = (value: string) => {
    bookmarkPageStore.setSelectedType(value);
    if (value === 'All') {
        fetchBookmarkList();
    } else {
        fetchBookmarkList(value);
    }
};
const handleUpdateSelectIndex = async (indices: number[]) => {
    bookmarkPageStore.setSelectedBookmarkIndices(indices);
};
const fetchBookmarkList = async (selectedType?: string) => {
    await bookmarkPageStore.fetchBookmarkList(selectedType);
};
const handleSelectDropdownMenu = (item: BookmarkItem, menu: string) => {
    bookmarkPageStore.setIsTableItem(true);
    if (menu === 'edit') {
        bookmarkStore.setModalType(item.link ? BOOKMARK_MODAL_TYPE.LINK : BOOKMARK_MODAL_TYPE.FOLDER, true);
        return;
    }
    if (menu === 'delete') {
        bookmarkStore.setModalType(item.link ? BOOKMARK_MODAL_TYPE.DELETE_LINK : BOOKMARK_MODAL_TYPE.DELETE_FOLDER);
        return;
    }
    if (menu === 'add') {
        bookmarkStore.setModalType(BOOKMARK_MODAL_TYPE.LINK);
        return;
    }

    bookmarkStore.setModalType(item.folder ? BOOKMARK_MODAL_TYPE.LINK : BOOKMARK_MODAL_TYPE.FOLDER, false);
};
const handleUpdateVisibleMenu = (item: BookmarkItem, visibleMenu: boolean) => {
    if (visibleMenu) {
        bookmarkStore.setSelectedBookmark(item, true);
    }
};
const handleClickName = (item: BookmarkItem) => {
    if (item.link) {
        window.open(item.link, '_blank');
        return;
    }
    router.push({
        name: ADMIN_ADVANCED_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME,
        params: {
            group: item.workspaceId || 'global',
            folder: item.name as string || '',
        },
    });
};

const handleChange = (options: any = {}) => {
    if (options.queryTags !== undefined) {
        const filters = makeSearchQueryTagsHandler(options.queryTags);
        bookmarkPageStore.setBookmarkListSearchFilters(filters);
        fetchBookmarkList();
    }
    if (options.pageStart !== undefined) {
        bookmarkPageStore.setBookmarkListPageStart(options.pageStart - 1);
        bookmarkPageStore.setSelectedBookmarkIndices([]);
    }
    if (options.pageLimit !== undefined) {
        bookmarkPageStore.setBookmarkListPageLimit(options.pageLimit);
        bookmarkPageStore.setSelectedBookmarkIndices([]);
    }
};

watch([() => route.params, () => storeState.bookmarkFolderList], async ([params, bookmarkFolderList]) => {
    if (!bookmarkFolderList || bookmarkFolderList?.length === 0) return;
    await bookmarkPageStore.setParams(params);
    await bookmarkPageStore.setSelectedBookmarkIndices([]);
    await bookmarkPageStore.setBookmarkListPageStart(0);
    await bookmarkPageStore.setSelectedType('All');
    await fetchBookmarkList();
}, { immediate: true });
</script>

<template>
    <section class="bookmark-management-detail-table">
        <p-data-loader :loading="storeState.loading"
                       class="data-loader-wrapper"
                       :data="true"
        >
            <p-toolbox-table class="table"
                             search-type="query"
                             searchable
                             :selectable="state.group === 'global'"
                             sortable
                             sort-by="name"
                             :sort-desc="true"
                             :page-size="30"
                             :page-size-options="PageSizeOptions"
                             :select-index="storeState.selectedIndices"
                             :fields="tableState.fields"
                             :total-count="bookmarkPageGetters.entireBookmarkList.length"
                             :items="storeState.bookmarkList"
                             :key-item-sets="tableState.keyItemSets"
                             :value-handler-map="tableState.valueHandlerMap"
                             @change="handleChange"
                             @refresh="fetchBookmarkList"
                             @update:select-index="handleUpdateSelectIndex"
            >
                <template v-if="!state.folder"
                          #toolbox-bottom
                >
                    <div class="select-type-wrapper">
                        <span class="mr-2">{{ $t('IAM.BOOKMARK.TYPE') }}</span>
                        <p-select-status v-for="(item, idx) in tableState.typeField"
                                         :key="idx"
                                         :selected="storeState.selectedType"
                                         class="mr-2"
                                         :value="item.name"
                                         @change="handleSelectType"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                </template>
                <template #col-name-format="{value, item}">
                    <div class="col-name"
                         @click="handleClickName(item)"
                    >
                        <p-lazy-img v-if="item.link"
                                    class="left-icon"
                                    :src="item.imgIcon"
                                    width="1.5rem"
                                    height="1.5rem"
                                    error-icon="ic_link"
                                    :error-icon-color="gray[500]"
                        />
                        <p-i v-else
                             name="ic_folder"
                             color="inherit"
                             width="1.25rem"
                             height="1.25rem"
                        />
                        <span class="name">{{ value }}</span>
                    </div>
                </template>
                <template #col-link-format="{value}">
                    <span class="col-link">{{ value ?? '--' }}</span>
                </template>
                <template #col-action_button-format="{item}">
                    <p-select-dropdown v-if="hasReadWriteAccess && item.isGlobal"
                                       :menu="getDropdownMenu(item)"
                                       style-type="icon-button"
                                       button-icon="ic_ellipsis-horizontal"
                                       use-fixed-menu-style
                                       class="overlay"
                                       reset-selected-on-unmounted
                                       menu-position="right"
                                       @select="handleSelectDropdownMenu(item, $event)"
                                       @update:visible-menu="handleUpdateVisibleMenu(item, $event)"
                    />
                </template>
            </p-toolbox-table>
        </p-data-loader>
    </section>
</template>

<style lang="postcss" scoped>
.bookmark-management-detail-table {
    .table {
        .col-name {
            @apply flex items-center;
            gap: 0.5rem;
            .name {
                @apply truncate;
            }
            &:hover {
                @apply cursor-pointer underline;
            }
        }
        .col-link {
            @apply block truncate;
            max-width: 22.125rem;
        }
        .select-type-wrapper {
            @apply flex items-center text-label-md text-gray-600;
            gap: 0.5rem;
            margin-left: 1rem;
            margin-bottom: 1rem;
        }
    }

    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        .p-toolbox {
            padding-bottom: 0;
        }
        .table-container {
            padding-bottom: 2.5rem;
        }
        td {
            &.has-width {
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
                min-width: unset;
            }
        }
    }
}
</style>
