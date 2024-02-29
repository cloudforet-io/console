<script setup lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import { useElementBounding, useWindowSize } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PCheckboxGroup, PCheckbox, PTooltip, PToggleButton, PTextButton, PContextMenu, PIconButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ResourceSearchParameters, ResourceSearchResponse } from '@/schema/search/resource/api-verbs/search';
import type { ResourceModel } from '@/schema/search/resource/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ScopedNotification from '@/common/components/scoped-notification/ScopedNotification.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import type { StageWorkspace } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';
import {
    useTopBarSearchStore,
} from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const topBarSearchStore = useTopBarSearchStore();

const storeState = reactive({
    workspaceMap: computed(() => allReferenceGetters.workspace),
    stagedWorkspaces: computed(() => topBarSearchStore.state.stagedWorkspaces),
    selectedWorkspaces: computed(() => topBarSearchStore.getters.selectedWorkspaces),
});

const searchContextMenuRef = ref<null | HTMLElement>(null);
const searchContextMenuElementBounding = useElementBounding(searchContextMenuRef);
const windowSize = useWindowSize();

const STAGED_WORKSPACE_LIMIT = 5;

const state = reactive({
    isAllSelected: false,
    // workspace search menu
    isActivatedSearchMenu: false,
    searchText: '',
    nextToken: undefined as string | undefined,
    searchResult: [] as ResourceModel[],
    searchResultMenu: computed<MenuItem[]>(() => {
        const filteredResults = state.searchResult?.filter((workspace) => !storeState.stagedWorkspaces.some((stagedWorkspace) => stagedWorkspace.name === workspace.workspace_id));
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
    topBarSearchStore.setSelectedWorkspaces(selected);
};

const handleSelectItem = (item) => {
    topBarSearchStore.addStagedWorkspace({
        name: item.name,
        label: item.label,
        theme: storeState.workspaceMap[item.name]?.data?.tags?.theme,
        isSelected: true,
    });
    state.isActivatedSearchMenu = false;
};

const handleRemoveItem = (workspace: StageWorkspace) => {
    topBarSearchStore.removeStagedWorkspace(workspace);
};

const handleCheckAll = (val:boolean) => {
    state.isAllSelected = val;
};

const handleUpdateSearchText = (val: string) => {
    state.searchText = val;
};

(() => {
    topBarSearchStore.initWorkspaces();
})();

watch(() => state.searchText, (val) => {
    fetchSearchResult(val);
}, { immediate: true });

</script>

<template>
    <div class="top-bar-search-workspace-filter">
        <div class="all-workspace-toggle">
            <p-toggle-button :value="state.isAllSelected"
                             @change-toggle="handleCheckAll"
            /><span>{{ $t('COMMON.NAVIGATIONS.TOP_BAR.ALL_WORKSPACE') }}</span>
        </div>
        <div class="workspace-filter-wrapper">
            <p class="filter-list-header">
                {{ $t('Filter by Workspace') }}
            </p>
            <p-checkbox-group class="checkbox-group"
                              direction="vertical"
            >
                <p-tooltip v-for="workspace in storeState.stagedWorkspaces"
                           :key="workspace.name"
                           :contents="workspace.label"
                           position="bottom"
                >
                    <p-checkbox
                        :selected="storeState.selectedWorkspaces"
                        :value="workspace.name"
                        @change="handleSelected"
                    >
                        <div class="workspace-item-wrapper">
                            <span class="workspace-item">
                                <workspace-logo-icon :text="workspace.label"
                                                     :theme="workspace.theme"
                                                     size="xs"
                                /> <span class="label">{{ workspace.label }}</span>
                            </span>
                            <p-icon-button name="ic_close"
                                           size="sm"
                                           @click="() => handleRemoveItem(workspace)"
                            />
                        </div>
                    </p-checkbox>
                </p-tooltip>
            </p-checkbox-group>
            <div v-if="storeState.stagedWorkspaces.length < 5">
                <p-text-button style-type="highlight"
                               class="show-more"
                               @click="state.isActivatedSearchMenu = !state.isActivatedSearchMenu"
                >
                    {{ $t('Show more') }}
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
            </div>
            <div v-else
                 class="limit-description-card"
            >
                <scoped-notification type="warning"
                                     :title="$t('You can filter by a maximum of 5 workspaces.')"
                                     title-icon="ic_warning-filled"
                                     :visible="true"
                                     layout="insection"
                                     hide-header-close-button
                >
                    <span class="text">{{ $t('Please unselect at least one workspace before making a new selection.') }}</span>
                </scoped-notification>
            </div>
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

            .workspace-item-wrapper {
                @apply inline-flex items-center justify-between;
                .workspace-item {
                    @apply inline-flex items-center gap-1;
                    margin-left: 0.125rem;

                    .label {
                        @apply truncate;
                        width: 9rem;
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

        .limit-description-card {
            width: 100%;

            .text {
                @apply text-paragraph-md;
            }
        }
    }
}
</style>
