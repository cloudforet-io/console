<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import {
    PToolboxTable, PLazyImg, PI, PDataLoader,
} from '@spaceone/design-system';
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import { useQueryTags } from '@/common/composables/query-tags';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { getWorkspaceInfo } from '@/services/preference/composables/bookmark-data-helper';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
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

const getFolderInfo = (id: string): BookmarkItem|undefined => {
    if (!id) return undefined;
    return storeState.bookmarkFolderList.find((i) => i.id === id);
};

const BookmarkListApiQueryHelper = new ApiQueryHelper();
let bookmarkListApiQuery = BookmarkListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const handleUpdateSelectIndex = async (indices: number[]) => {
    bookmarkPageStore.setSelectedBookmarkIndices(indices);
};
const handleChange = (options: any = {}) => {
    bookmarkListApiQuery = getApiQueryWithToolboxOptions(BookmarkListApiQueryHelper, options) ?? bookmarkListApiQuery;
    if (options.queryTags !== undefined) {
        bookmarkPageStore.setBookmarkListSearchFilters(BookmarkListApiQueryHelper.filters);
    }
    if (options.pageStart !== undefined) bookmarkPageStore.setBookmarkListPageStart(options.pageStart - 1);
    if (options.pageLimit !== undefined) bookmarkPageStore.setBookmarkListPageLimit(options.pageLimit);
    fetchBookmarkList();
};

const fetchBookmarkList = async () => {
    await bookmarkPageStore.fetchBookmarkList();
};

onMounted(async () => {
    await fetchBookmarkList();
});
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
                <template #col-workspace_id-format="{value, item}">
                    <div class="col-workspace">
                        <div v-if="item.isGlobal"
                             class="workspace"
                        >
                            <p-i name="ic_globe-filled"
                                 :color="gray[500]"
                                 width="1rem"
                                 height="1rem"
                            />
                            <span class="global">{{ $t('IAM.BOOKMARK.GLOBAL_BOOKMARK') }}</span>
                        </div>
                        <div v-else
                             class="workspace"
                        >
                            <workspace-logo-icon :text="getWorkspaceInfo(value, storeState.workspaceList)?.name || ''"
                                                 :theme="getWorkspaceInfo(value, storeState.workspaceList)?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="text">{{ getWorkspaceInfo(value, storeState.workspaceList)?.name }}</span>
                        </div>
                        <div v-if="item.folder"
                             class="folder-wrapper"
                        >
                            <p-i name="ic_chevron-right-thin"
                                 width="1rem"
                                 height="1rem"
                            />
                            <span class="text">{{ getFolderInfo(item.folder)?.name }}</span>
                        </div>
                    </div>
                </template>
                <template #col-link-format="{value}">
                    <span class="col-link">{{ value ?? '-' }}</span>
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
                max-width: 20.625rem;
            }
        }
        .col-workspace {
            @apply flex items-center;
            .workspace {
                @apply flex items-center;
                gap: 0.25rem;
            }
            .folder-wrapper {
                @apply flex items-center;
            }
            .text {
                @apply truncate;
                max-width: 10rem;
            }
        }
        .col-link {
            @apply block truncate;
            max-width: 12rem;
        }
    }
}
</style>
