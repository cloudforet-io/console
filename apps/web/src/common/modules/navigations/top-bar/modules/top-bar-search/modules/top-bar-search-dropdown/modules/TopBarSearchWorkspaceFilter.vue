<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PCheckboxGroup, PCheckbox, PTooltip, PToggleButton,
} from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;
const topBarSearchStore = useTopBarSearchStore();

const storeState = reactive({
    currentWorkspaceId: computed(() => workspaceStoreState.getters.currentWorkspaceId),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
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
    isIndeterminate: computed(() => state.selectedWorkspaces.length > 0 && state.selectedWorkspaces.length < state.workspaces.length),
});

const handleSelected = (selected: string[]) => { topBarSearchStore.setSelectedWorkspaces(selected); };

const handleCheckAll = (val:boolean) => {
    state.isAllSelected = val;
};

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
        </div>
    </div>
</template>

<style scoped lang="scss">
.top-bar-search-workspace-filter {
    flex-basis: 14.25rem;
    flex-shrink: 0;

    .all-workspace-toggle {
        @apply flex items-center gap-1 mb-3;
        span {
            @apply text-gray-900 text-label-md;
        }
    }

    .workspace-filter-wrapper {
        .filter-list-header {
            @apply text-gray-500 text-label-sm font-bold mb-2;
        }

        .checkbox-group {
            @apply pr-3;
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
    }
}
</style>
