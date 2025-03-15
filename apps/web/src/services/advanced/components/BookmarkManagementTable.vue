<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PToolboxTable, PLazyImg, PI, PDataLoader, PSelectDropdown, PLink, PSelectStatus,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { KeyItemSet, ValueHandlerMap, ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';


import { gray } from '@/styles/colors';

import {
    makeSearchQueryTagsHandler,
    makeValueHandler,
} from '@/services/advanced/composables/bookmark-data-helper';
import {
    getWorkspaceInfo,
} from '@/services/advanced/composables/refined-table-data';
import { BOOKMARK_TYPE, PageSizeOptions } from '@/services/advanced/constants/bookmark-constant';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { useBookmarkPageStore } from '@/services/advanced/store/bookmark-page-store';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const bookmarkStore = useBookmarkStore();
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    bookmarkFolderList: computed<BookmarkItem[]>(() => bookmarkPageState.bookmarkFolderList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList),
    entireBookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.entireBookmarkList),
    workspaceList: computed<WorkspaceModel[]>(() => bookmarkPageState.workspaceList),
    selectedIndices: computed<number[]>(() => bookmarkPageState.selectedIndices),
    pageStart: computed<number>(() => bookmarkPageState.pageStart),
    pageLimit: computed<number>(() => bookmarkPageState.pageLimit),
    loading: computed<boolean>(() => bookmarkPageState.loading),
    selectedType: computed<string>(() => bookmarkPageState.selectedType),
    searchFilter: computed<ConsoleFilter[]>(() => bookmarkPageState.searchFilter),
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
            width: '2rem',
            sortable: false,
        },
    ]),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'scope', label: 'Scope' },
            { name: 'link', label: 'Link' },
        ],
    }]),
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        name: makeValueHandler(storeState.entireBookmarkList, 'name'),
        scope: makeValueHandler(storeState.entireBookmarkList, 'scope'),
        link: makeValueHandler(storeState.entireBookmarkList, 'link'),
    })),
    typeField: computed<ValueItem[]>(() => ([
        { label: i18n.t('IAM.BOOKMARK.ALL') as string, name: 'All' },
        { label: i18n.t('IAM.BOOKMARK.LINK') as string, name: BOOKMARK_TYPE.LINK },
        { label: i18n.t('IAM.BOOKMARK.FOLDER') as string, name: BOOKMARK_TYPE.FOLDER },
    ])),
});
const state = reactive({
    folder: computed<string>(() => route.params.folder),
});

const getFolderInfo = (id: string): BookmarkItem|undefined => {
    if (!id) return undefined;
    return storeState.bookmarkFolderList.find((i) => i.id === id);
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

    bookmarkStore.setModalType(item.link ? BOOKMARK_MODAL_TYPE.LINK : BOOKMARK_MODAL_TYPE.FOLDER, false);
};
const handleUpdateVisibleMenu = (item: BookmarkItem, visibleMenu: boolean) => {
    if (visibleMenu) {
        bookmarkStore.setSelectedBookmark(item);
    }
};
const getRowSelectable = (item) => item.isGlobal;
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

const fetchBookmarkList = async (selectedType?: string) => {
    await bookmarkPageStore.fetchBookmarkList(selectedType);
};

watch(() => route.params, async () => {
    bookmarkPageStore.setParams(undefined);
    await bookmarkPageStore.setSelectedBookmarkIndices([]);
    await bookmarkPageStore.setBookmarkListPageStart(0);
    await bookmarkPageStore.setSelectedType('All');
    await fetchBookmarkList();
}, { immediate: true });
</script>

<template>
    <section class="bookmark-management-table">
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
                             :page-size="30"
                             :page-size-options="PageSizeOptions"
                             :select-index="storeState.selectedIndices"
                             :fields="tableState.fields"
                             :total-count="bookmarkPageGetters.entireBookmarkList.length"
                             :items="storeState.bookmarkList"
                             :key-item-sets="tableState.keyItemSets"
                             :value-handler-map="tableState.valueHandlerMap"
                             :get-row-selectable="getRowSelectable"
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
                                    error-icon="ic_link"
                                    :error-icon-color="gray[500]"
                                    width="1.5rem"
                                    height="1.5rem"
                        />
                        <p-i v-else
                             name="ic_folder"
                             color="inherit"
                             width="1.25rem"
                             height="1.25rem"
                        />
                        <span class="name">
                            {{ value }}
                            <p-i v-if="item.link"
                                 name="ic_external-link"
                                 color="inherit"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                        </span>
                    </div>
                </template>
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template #col-workspace_id-format="{_, item}">
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
                        <p-link v-else-if="getWorkspaceInfo(item.workspaceId, storeState.workspaceList)?.state === WORKSPACE_STATE.ENABLE"
                                :to="{
                                    name: WORKSPACE_HOME_ROUTE._NAME,
                                    params: {
                                        workspaceId: item.workspaceId,
                                    },
                                }"
                                action-icon="internal-link"
                                new-tab
                                class="workspace"
                        >
                            <workspace-logo-icon :text="getWorkspaceInfo(item.workspaceId, storeState.workspaceList)?.name || ''"
                                                 :theme="getWorkspaceInfo(item.workspaceId, storeState.workspaceList)?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="text">{{ getWorkspaceInfo(item.workspaceId, storeState.workspaceList)?.name }}</span>
                        </p-link>
                        <div v-else
                             class="workspace"
                        >
                            <workspace-logo-icon :text="getWorkspaceInfo(item.workspaceId, storeState.workspaceList)?.name || ''"
                                                 :theme="getWorkspaceInfo(item.workspaceId, storeState.workspaceList)?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="text">{{ getWorkspaceInfo(item.workspaceId, storeState.workspaceList)?.name }}</span>
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
                <template #col-action_button-format="{item}">
                    <p-select-dropdown v-if="props.hasReadWriteAccess && item.isGlobal"
                                       :menu="getDropdownMenu(item)"
                                       style-type="icon-button"
                                       button-icon="ic_ellipsis-horizontal"
                                       use-fixed-menu-style
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
.bookmark-management-table {
    .table {
        .col-name {
            @apply flex items-center;
            gap: 0.5rem;
            .name {
                @apply flex items-center truncate;
                gap: 0.125rem;
                max-width: 20.625rem;
            }
            &:hover {
                @apply cursor-pointer underline;
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

            /* custom design-system component - p-link */
            :deep(.p-link) {
                @apply flex items-center;
                gap: 0.25rem;
                .text {
                    @apply flex items-center;
                    gap: 0.25rem;
                }
            }
        }
        .col-link {
            @apply block truncate;
            max-width: 12rem;
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
