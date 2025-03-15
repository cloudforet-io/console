<script setup lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import { useElementBounding, useWindowSize } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PCheckboxGroup, PCheckbox, PTooltip, PToggleButton, PTextButton, PContextMenu, PIconButton, PScopedNotification,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';


import type { ResourceSearchParameters, ResourceSearchResponse } from '@/schema/search/resource/api-verbs/search';
import type { ResourceModel } from '@/schema/search/resource/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import {
    useTopBarSearchStore,
} from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
import type { StageWorkspace } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const topBarSearchStore = useTopBarSearchStore();

const storeState = reactive({
    workspaceMap: computed(() => allReferenceGetters.workspace),
    stagedWorkspaces: computed(() => topBarSearchStore.state.stagedWorkspaces),
    selectedWorkspaces: computed(() => topBarSearchStore.getters.selectedWorkspaces),
    isAllSelected: computed(() => topBarSearchStore.state.allWorkspacesChecked),
    currentWorkspaceId: computed(() => topBarSearchStore.storeState.currentWorkspaceId),
});

const searchContextMenuRef = ref<null | HTMLElement>(null);
const searchContextMenuElementBounding = useElementBounding(searchContextMenuRef);
const windowSize = useWindowSize();

const STAGED_WORKSPACE_LIMIT = 5;

const state = reactive({
    // workspace search menu
    isActivatedSearchMenu: false,
    searchText: '',
    nextToken: undefined as string | undefined,
    searchResult: [] as ResourceModel[],
    searchResultMenu: computed<MenuItem[]>(() => {
        const filteredResults = state.searchResult?.filter((workspace) => !storeState.stagedWorkspaces.some((stagedWorkspace) => stagedWorkspace.workspaceId === workspace.workspace_id));
        const workspaceMenuItems:MenuItem[] = filteredResults.map((workspace:ResourceModel) => ({
            type: 'item',
            label: workspace.name,
            name: workspace.workspace_id,
        }));
        if (state.nextToken?.length) {
            workspaceMenuItems.push({
                type: 'showMore',
                label: 'Show more',
            });
        }
        return workspaceMenuItems;
    }),
    searchContextMenuMaxHeight: computed(() => `${windowSize.height.value - (searchContextMenuElementBounding.top.value + 16)}px`),
});

const fetchSearchResult = async (searchText: string) => {
    try {
        const { results, next_token } = await SpaceConnector.clientV2.search.resource.search<ResourceSearchParameters, ResourceSearchResponse>({
            resource_type: 'identity.Workspace',
            keyword: searchText,
            limit: 10,
            all_workspaces: true,
        });
        state.searchResult = results ?? [];
        if (next_token?.length) state.nextToken = next_token;
        else state.nextToken = '';
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const fetchMoreSearchResult = async () => {
    try {
        const { results, next_token } = await SpaceConnector.clientV2.search.resource.search<ResourceSearchParameters, ResourceSearchResponse>({
            resource_type: 'identity.Workspace',
            next_token: state.nextToken,
        });
        if (results) state.searchResult = state.searchResult.concat(results);
        if (next_token?.length) state.nextToken = next_token;
        else state.nextToken = '';
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleSelected = (selected: string[]) => {
    if (selected.length > STAGED_WORKSPACE_LIMIT) return;
    topBarSearchStore.setSelectedWorkspaces(selected);
};

const handleSelectItem = (item:MenuItem) => {
    if (item.name && typeof item.label === 'string') {
        topBarSearchStore.addStagedWorkspace({
            workspaceId: item.name,
            label: item.label,
            theme: storeState.workspaceMap[item.name]?.data?.tags?.theme,
            isSelected: false,
        });
    }
    state.isActivatedSearchMenu = false;
};

const handleRemoveItem = (workspace: StageWorkspace) => {
    topBarSearchStore.removeStagedWorkspace(workspace);
};

const handleCheckAll = (val:boolean) => {
    topBarSearchStore.$patch((_state) => {
        _state.state.allWorkspacesChecked = val;
    });
};

const handleUpdateSearchText = (val: string) => {
    state.searchText = val;
};

const handleClickShowMoreButton = () => {
    state.searchText = '';
    if (!state.isActivatedSearchMenu) fetchSearchResult(state.searchText);
    state.isActivatedSearchMenu = !state.isActivatedSearchMenu;
};

(() => {
    topBarSearchStore.initWorkspaces();
})();

watch(() => state.searchText, (val) => {
    fetchSearchResult(val);
});

</script>

<template>
    <div class="top-bar-search-workspace-filter">
        <div class="all-workspace-toggle">
            <p-toggle-button :value="storeState.isAllSelected"
                             @change-toggle="handleCheckAll"
            /><span>{{ $t('COMMON.NAVIGATIONS.TOP_BAR.ALL_WORKSPACE') }}</span>
        </div>
        <div v-if="!storeState.isAllSelected"
             class="workspace-filter-wrapper"
        >
            <p class="filter-list-header">
                {{ $t('COMMON.NAVIGATIONS.TOP_BAR.FILTER_BY_WORKSPACE') }}
            </p>
            <p-checkbox-group class="checkbox-group"
                              direction="vertical"
            >
                <p-tooltip v-for="workspace in storeState.stagedWorkspaces"
                           :key="workspace.workspaceId"
                           :contents="workspace.label"
                           position="bottom"
                           class="workspace-item-tooltip"
                >
                    <p-checkbox
                        :selected="storeState.selectedWorkspaces"
                        :value="workspace.workspaceId"
                        :disabled="storeState.isAllSelected"
                        @change="handleSelected"
                    >
                        <div class="workspace-item-wrapper">
                            <span class="workspace-item">
                                <workspace-logo-icon :text="workspace.label"
                                                     :theme="workspace.theme"
                                                     size="xs"
                                                     :class="{'opacity-70': storeState.isAllSelected}"
                                /> <span class="label">{{ workspace.label }}</span>
                            </span>
                            <p-icon-button v-if="workspace.workspaceId !== storeState.currentWorkspaceId"
                                           class="remove-button"
                                           name="ic_close"
                                           size="sm"
                                           @click="() => handleRemoveItem(workspace)"
                            />
                        </div>
                    </p-checkbox>
                </p-tooltip>
            </p-checkbox-group>
            <p-text-button style-type="highlight"
                           class="show-more"
                           @click="handleClickShowMoreButton"
            >
                {{ $t('COMMON.COMPONENTS.FAVORITES.FAVORITE_LIST.TOGGLE_MORE') }}
            </p-text-button>
            <p-context-menu v-if="state.isActivatedSearchMenu"
                            ref="searchContextMenuRef"
                            v-on-click-outside="() => { state.isActivatedSearchMenu = false; }"
                            :search-text="state.searchText"
                            :menu="state.searchResultMenu"
                            :style="{ maxHeight: state.searchContextMenuMaxHeight}"
                            searchable
                            class="search-context-menu"
                            @update:search-text="handleUpdateSearchText"
                            @click-show-more="fetchMoreSearchResult"
                            @select="handleSelectItem"
            >
                <template #item--format="{ item }">
                    <span class="search-workspace-item">
                        <workspace-logo-icon :text="item.label"
                                             :theme="storeState.workspaceMap[item?.name]?.data?.tags?.theme"
                                             size="xs"
                        /> <span class="label">{{ item.label }}</span>
                    </span>
                </template>
            </p-context-menu>
            <p-scoped-notification v-if="storeState.selectedWorkspaces.length >= STAGED_WORKSPACE_LIMIT"
                                   type="warning"
                                   :title="$t('COMMON.NAVIGATIONS.TOP_BAR.WORKSPACE_FILTER_WARNING_TITLE')"
                                   icon="ic_warning-filled"
                                   layout="in-section"
            >
                {{ $t('COMMON.NAVIGATIONS.TOP_BAR.WORKSPACE_FILTER_WARNING_DESC') }}
            </p-scoped-notification>
        </div>
    </div>
</template>

<style scoped lang="scss">
.top-bar-search-workspace-filter {
    @apply pr-3;
    flex-basis: 14.25rem;
    flex-shrink: 0;
    min-height: 25rem;
    max-width: 14.875rem;

    .all-workspace-toggle {
        @apply flex items-center gap-1 mb-3;
        span {
            @apply text-gray-900 text-label-md;
        }
    }

    .workspace-filter-wrapper {
        @apply relative;
        .filter-list-header {
            @apply text-gray-500 text-label-sm font-bold mb-2;
        }

        .checkbox-group {
            @apply mb-2;
            flex: 1 0 13.25rem;
            overflow-y: auto;

            .workspace-item-tooltip {
                .workspace-item-wrapper {
                    @apply inline-flex items-center justify-between;
                    height: 1.5rem;
                    .workspace-item {
                        @apply inline-flex items-center gap-1;
                        margin-left: 0.125rem;

                        .opacity-70 {
                            opacity: 0.7;
                        }

                        .label {
                            @apply truncate;
                            width: 9rem;
                        }
                    }
                    .remove-button {
                        visibility: hidden;
                    }

                    &:hover {
                        .remove-button {
                            visibility: unset;
                        }
                    }
                }
            }
        }

        .show-more {
            margin-bottom: 0.375rem;
        }

        .search-context-menu {
            @apply absolute;
            width: 100%;

            .search-workspace-item {
                @apply inline-flex items-center gap-1;
                margin-left: 0.125rem;

                .label {
                    @apply truncate;
                    width: 10.5rem;
                }
            }
        }
    }
}
</style>
