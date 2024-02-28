<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import {
    PCheckboxGroup, PCheckbox, PTooltip, PToggleButton, PTextButton, PContextMenu,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import type { ResourceSearchParameters, ResourceSearchResponse } from '@/schema/search/resource/api-verbs/search';
import type { ResourceModel } from '@/schema/search/resource/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;
const topBarSearchStore = useTopBarSearchStore();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    currentWorkspaceId: computed(() => workspaceStoreState.getters.currentWorkspaceId),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
    workspaceMap: computed(() => allReferenceGetters.workspace),
});

const state = reactive({
    workspaces: computed(() => {
        const workspaceList = storeState.workspaceList.map((workspace) => ({
            label: workspace.name,
            value: workspace.workspace_id,
            tags: workspace.tags,
        } as { label: string, value: string, tags: { theme: string } | undefined }));
        // 현재 워크스페이스를 가장 상단에 위치시키기 위해 정렬
        const orderedWorkspaceList = workspaceList.sort((a, b) => {
            if (a.value === storeState.currentWorkspaceId) return -1;
            if (b.value === storeState.currentWorkspaceId) return 1;
            return 0;
        });
        return orderedWorkspaceList.slice(0, 3);
    }),
    selectedWorkspaces: computed(() => topBarSearchStore.state.selectedWorkspaces),
    isAllSelected: false,
    // workspace search menu
    isActivatedSearchMenu: false,
    searchText: '',
    nextToken: undefined as string | undefined,
    searchResult: [] as ResourceModel[],
    searchResultMenu: computed<MenuItem[]>(() => {
        const workspaceMenuItems:MenuItem[] = state.searchResult.map((workspace:ResourceModel) => ({
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

const handleSelected = (selected: string[]) => { topBarSearchStore.setSelectedWorkspaces(selected); };

const handleCheckAll = (val:boolean) => {
    state.isAllSelected = val;
};

const handleUpdateSearchText = (val: string) => {
    state.searchText = val;
};

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
                <p-tooltip v-for="workspace in state.workspaces"
                           :key="workspace.value"
                           :contents="workspace.label"
                           position="bottom"
                >
                    <p-checkbox
                        :selected="state.selectedWorkspaces"
                        :value="workspace.value"
                        @change="handleSelected"
                    >
                        <span class="workspace-item">
                            <workspace-logo-icon :text="workspace.label"
                                                 :theme="workspace.tags?.theme"
                                                 size="xs"
                            /> <span class="label">{{ workspace.label }}</span>
                        </span>
                    </p-checkbox>
                </p-tooltip>
            </p-checkbox-group>
            <p-text-button style-type="highlight"
                           class="show-more"
                           @click="state.isActivatedSearchMenu = !state.isActivatedSearchMenu"
            >
                {{ $t('Show more') }}
            </p-text-button>
            <p-context-menu v-if="state.isActivatedSearchMenu"
                            :search-text="state.searchText"
                            :menu="state.searchResultMenu"
                            searchable
                            class="search-context-menu"
                            @update:search-text="handleUpdateSearchText"
                            @click-show-more="fetchMoreSearchResult"
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
    </div>
</template>

<style scoped lang="scss">
.top-bar-search-workspace-filter {
    @apply pr-3;
    flex-basis: 14.25rem;
    flex-shrink: 0;
    min-height: 25rem;

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

            .workspace-item {
                @apply inline-flex items-center gap-1;
                margin-left: 0.125rem;

                .label {
                    @apply truncate;
                    width: 10.5rem;
                }
            }
        }

        .show-more {
            margin-bottom: 0.375rem;
        }

        .search-context-menu {
            @apply absolute;
            width: 100%;
            max-height: 200%;
            overflow-y: auto;

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
