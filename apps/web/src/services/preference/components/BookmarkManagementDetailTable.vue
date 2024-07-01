<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PToolboxTable, PLazyImg, PI, PDataLoader, PSelectStatus,
} from '@spaceone/design-system';
import type {
    KeyItemSet,
    ValueHandlerMap,
    ValueItem,
} from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import { useQueryTags } from '@/common/composables/query-tags';

import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;

const storeState = reactive({
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
    bookmarkTotalCount: computed<number>(() => bookmarkPageState.bookmarkTotalCount),
    selectedIndices: computed<number[]>(() => bookmarkPageState.selectedIndices),
    pageStart: computed<number>(() => bookmarkPageState.pageStart),
    pageLimit: computed<number>(() => bookmarkPageState.pageLimit),
    loading: computed<boolean>(() => bookmarkPageState.loading),
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
            type: 'item',
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
        name: makeDistinctValueHandler('config.PublicConfig', 'name'),
        link: makeDistinctValueHandler('config.PublicConfig', 'link'),
    })),
    typeField: computed<ValueItem[]>(() => ([
        { label: i18n.t('IAM.BOOKMARK.ALL') as string, name: 'All' },
        { label: i18n.t('IAM.BOOKMARK.LINK') as string, name: BOOKMARK_MODAL_TYPE.LINK },
        { label: i18n.t('IAM.BOOKMARK.FOLDER') as string, name: BOOKMARK_MODAL_TYPE.FOLDER },
    ])),
    selectedType: 'All' as string,
});

const handleSelectType = (value: string) => {
    tableState.selectedType = value;
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

const BookmarkListApiQueryHelper = new ApiQueryHelper();
let bookmarkListApiQuery = BookmarkListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const handleChange = (options: any = {}) => {
    bookmarkListApiQuery = getApiQueryWithToolboxOptions(BookmarkListApiQueryHelper, options) ?? bookmarkListApiQuery;
    if (options.queryTags !== undefined) {
        bookmarkPageStore.setBookmarkListSearchFilters(BookmarkListApiQueryHelper.filters);
    }
    if (options.pageStart !== undefined) bookmarkPageStore.setBookmarkListPageStart(options.pageStart - 1);
    if (options.pageLimit !== undefined) bookmarkPageStore.setBookmarkListPageLimit(options.pageLimit);
    fetchBookmarkList();
};
</script>

<template>
    <section class="data-source-management-table">
        <p-data-loader :loading="storeState.loading"
                       class="data-loader-wrapper"
                       :data="true"
        >
            <p-toolbox-table class="table"
                             search-type="query"
                             searchable
                             selectable
                             sortable
                             sort-by="name"
                             :sort-desc="true"
                             :select-index="storeState.selectedIndices"
                             :fields="tableState.fields"
                             :total-count="storeState.bookmarkTotalCount"
                             :items="storeState.bookmarkList"
                             :key-item-sets="tableState.keyItemSets"
                             :value-handler-map="tableState.valueHandlerMap"
                             :query-tags="queryTags"
                             @change="handleChange"
                             @refresh="fetchBookmarkList"
                             @update:select-index="handleUpdateSelectIndex"
            >
                <template #toolbox-bottom>
                    <div class="select-type-wrapper">
                        <span>{{ $t('IAM.BOOKMARK.TYPE') }}</span>
                        <p-select-status v-for="(item, idx) in tableState.typeField"
                                         :key="idx"
                                         :selected="tableState.selectedType"
                                         class="mr-2"
                                         :value="item.name"
                                         @change="handleSelectType"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                </template>
                <template #col-name-format="{value, item}">
                    <div class="col-name">
                        <p-lazy-img v-if="item.link"
                                    class="left-icon"
                                    :src="item.imgIcon"
                                    width="1.5rem"
                                    height="1.5rem"
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
            </p-toolbox-table>
        </p-data-loader>
    </section>
</template>

<style lang="postcss" scoped>
.data-source-management-table {
    .table {
        .col-name {
            @apply flex items-center;
            gap: 0.5rem;
            .name {
                @apply truncate;
            }
        }
        .col-link {
            @apply block truncate;
            max-width: 22.125rem;
        }
        .select-type-wrapper {
            @apply flex items-center text-label-md text-gray-600;
            gap: 1rem;
            margin-left: 1rem;
            margin-bottom: 1rem;
        }
    }

    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        .p-toolbox {
            padding-bottom: 0;
        }
    }
}
</style>
