<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PToolboxTable, PLazyImg, PI, PDataLoader, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem } from '@/common/components/bookmark/type/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import {
    getWorkspaceInfo,
    makeSearchQueryTagsHandler,
    makeValueHandler,
} from '@/services/preference/composables/bookmark-data-helper';
import { BOOKMARK_TYPE } from '@/services/preference/constants/bookmark-constant';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';
import { useBookmarkPageStore } from '@/services/preference/store/bookmark-page-store';

const bookmarkStore = useBookmarkStore();
const bookmarkPageStore = useBookmarkPageStore();
const bookmarkPageState = bookmarkPageStore.state;
const bookmarkPageGetters = bookmarkPageStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const router = useRouter();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    bookmarkList: computed<BookmarkItem[]>(() => bookmarkPageGetters.bookmarkList.filter((i) => !i.folder)),
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
            width: '2rem',
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
        type: makeEnumValueHandler(BOOKMARK_TYPE),
        name: makeValueHandler(storeState.bookmarkList, 'name'),
        scope: makeValueHandler(storeState.bookmarkList, 'scope'),
        link: makeValueHandler(storeState.bookmarkList, 'link'),
    })),
});
const dropdownState = reactive({
    menuItems: computed<MenuItem[]>(() => ([
        {
            icon: 'ic_edit',
            name: 'edit',
            label: i18n.t('IAM.BOOKMARK.EDIT'),
        },
        {
            icon: 'ic_delete',
            name: 'delete',
            label: i18n.t('IAM.BOOKMARK.DELETE'),
        },
    ])),
});

const getFolderInfo = (id: string): BookmarkItem|undefined => {
    if (!id) return undefined;
    return storeState.bookmarkFolderList.find((i) => i.id === id);
};

const handleUpdateSelectIndex = async (indices: number[]) => {
    bookmarkPageStore.setSelectedBookmarkIndices(indices);
};
const handleChange = (options: any = {}) => {
    if (options.queryTags !== undefined) {
        const filters = makeSearchQueryTagsHandler(options.queryTags);
        bookmarkPageStore.setBookmarkListSearchFilters(filters);
    }
    if (options.pageStart !== undefined) bookmarkPageStore.setBookmarkListPageStart(options.pageStart - 1);
    if (options.pageLimit !== undefined) bookmarkPageStore.setBookmarkListPageLimit(options.pageLimit);
    fetchBookmarkList();
};
const handleSelectDropdownMenu = (item: BookmarkItem, menu: string) => {
    bookmarkPageStore.setIsTableItem(true);
    if (menu === 'edit') {
        bookmarkStore.setModalType(item.folder ? BOOKMARK_MODAL_TYPE.LINK : BOOKMARK_MODAL_TYPE.FOLDER, true);
        return;
    }
    if (menu === 'delete') {
        bookmarkStore.setModalType(item.folder ? BOOKMARK_MODAL_TYPE.DELETE_LINK : BOOKMARK_MODAL_TYPE.DELETE_FOLDER);
        return;
    }

    bookmarkStore.setModalType(item.folder ? BOOKMARK_MODAL_TYPE.LINK : BOOKMARK_MODAL_TYPE.FOLDER, false);
};
const handleUpdateVisibleMenu = (item: BookmarkItem, visibleMenu: boolean) => {
    if (visibleMenu) {
        bookmarkStore.setSelectedBookmark(item);
    }
};
const getRowSelectable = (item) => !item.isGlobal;
const handleClickName = (item: BookmarkItem) => {
    if (item.link) {
        window.open(item.link, '_blank');
        return;
    }
    router.push({
        name: makeAdminRouteName(PREFERENCE_ROUTE.BOOKMARK.DETAIL.FOLDER._NAME),
        params: {
            group: item.workspaceId || 'global',
            folder: item.name as string || '',
        },
    });
};

const fetchBookmarkList = async () => {
    await bookmarkPageStore.fetchBookmarkList();
};

(async () => {
    bookmarkPageStore.setParams(undefined);
    await bookmarkPageStore.setSelectedBookmarkIndices([]);
    await fetchBookmarkList();
})();
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
                             :get-row-selectable="getRowSelectable"
                             @change="handleChange"
                             @refresh="fetchBookmarkList"
                             @update:select-index="handleUpdateSelectIndex"
            >
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
                <template #col-action_button-format="{item}">
                    <p-select-dropdown v-if="item.isGlobal"
                                       :menu="dropdownState.menuItems"
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
.data-source-management-table {
    .table {
        .col-name {
            @apply flex items-center;
            gap: 0.5rem;
            .name {
                @apply truncate;
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
        }
        .col-link {
            @apply block truncate;
            max-width: 12rem;
        }

        /* custom design-system component - p-select-dropdown */
        :deep(.p-select-dropdown) {
            .dropdown-context-menu {
                min-width: 7.25rem !important;
                margin-top: 0;
                margin-left: -5.25rem;
            }
        }
    }

    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        td.has-width {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
            min-width: unset;
        }
    }
}
</style>
