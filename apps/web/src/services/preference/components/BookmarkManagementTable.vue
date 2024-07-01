<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToolboxTable, PLazyImg } from '@spaceone/design-system';
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import { useQueryTags } from '@/common/composables/query-tags';

import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    dataSourceList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkList),
    selectedIndices: computed<number|undefined>(() => bookmarkPageState.selectedIndices),
    pageStart: computed<number>(() => bookmarkPageState.pageStart),
    pageLimit: computed<number>(() => bookmarkPageState.pageLimit),
});
const state = reactive({
    loading: false,
});
const tableState = reactive({
    fields: computed(() => [
        {
            name: 'name',
            label: 'Name',
            type: 'item',
        },
        {
            name: 'workspace_id',
            label: 'Scope',
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
            { name: 'type', label: 'Type' },
            { name: 'name', label: 'Name' },
            { name: 'scope', label: 'Scope' },
            { name: 'link', label: 'Link' },
        ],
    }]),
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        name: makeDistinctValueHandler('config.PublicConfig', 'name'),
        scope: makeDistinctValueHandler('config.PublicConfig', 'scope'),
        link: makeDistinctValueHandler('config.PublicConfig', 'link'),
    })),
});

const BookmarkListApiQueryHelper = new ApiQueryHelper();
let bookmarkListApiQuery = BookmarkListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const handleUpdateSelectIndex = async (indices: number[]) => {
    bookmarkPageStore.setSelectedBookmarkIndices(indices[0]);
};
const handleChange = (options: any = {}) => {
    bookmarkListApiQuery = getApiQueryWithToolboxOptions(BookmarkListApiQueryHelper, options) ?? bookmarkListApiQuery;
    if (options.queryTags !== undefined) {
        bookmarkPageStore.setBookmarkListSearchFilters(BookmarkListApiQueryHelper.filters);
    }
    if (options.pageStart !== undefined) bookmarkPageStore.setBookmarkListPageStart(options.pageStart);
    if (options.pageLimit !== undefined) bookmarkPageStore.setBookmarkListPageLimit(options.pageLimit);
    fetchBookmarkList();
};

const fetchBookmarkList = async () => {
    await bookmarkPageStore.fetchPublicBookmarkList();
};
</script>

<template>
    <section class="data-source-management-table">
        <p-toolbox-table class="table"
                         search-type="query"
                         searchable
                         selectable
                         sortable
                         sort-by="name"
                         :sort-desc="true"
                         :select-index="[storeState.selectedIndices]"
                         :fields="tableState.fields"
                         :items="storeState.dataSourceList"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         :loading="state.loading"
                         @change="handleChange"
                         @refresh="fetchBookmarkList"
                         @update:select-index="handleUpdateSelectIndex"
        >
            <template #col-name-format="{value, item}">
                <div class="col-name">
                    <p-lazy-img class="left-icon"
                                :src="item.icon"
                                width="1.5rem"
                                height="1.5rem"
                    />
                    <span>{{ value }}</span>
                </div>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.data-source-management-table {
    .table {
        .col-name {
            @apply flex items-center;
            gap: 0.5rem;
        }
        .col-data-source-account-count {
            @apply flex items-center;
            gap: 0.25rem;
        }
    }
}
</style>
