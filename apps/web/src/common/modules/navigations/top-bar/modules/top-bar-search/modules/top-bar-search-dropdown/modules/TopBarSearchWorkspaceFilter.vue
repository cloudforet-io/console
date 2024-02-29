<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PCheckboxGroup, PCheckbox, PTooltip } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/top-bar-search/store';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;
const topBarSearchStore = useTopBarSearchStore();

const state = reactive({
    currentWorkspaceId: computed(() => workspaceStoreState.getters.currentWorkspaceId),
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
    workspaces: computed(() => {
        const workspaceList = state.workspaceList.map((workspace) => ({
            label: workspace.name,
            value: workspace.workspace_id,
            tags: workspace.tags,
        } as { label: string, value: string, tags: { theme: string } | undefined }));
        // 현재 워크스페이스를 가장 상단에 위치시키기 위해 정렬
        const orderedWorkspaceList = workspaceList.sort((a, b) => {
            if (a.value === state.currentWorkspaceId) return -1;
            if (b.value === state.currentWorkspaceId) return 1;
            return 0;
        });
        return orderedWorkspaceList;
    }),
    selectedWorkspaces: computed(() => topBarSearchStore.state.selectedWorkspaces),
    isAllSelected: computed(() => state.selectedWorkspaces.length === state.workspaces.length),
    isIndeterminate: computed(() => state.selectedWorkspaces.length > 0 && state.selectedWorkspaces.length < state.workspaces.length),
});

const handleSelected = (selected: string[]) => { topBarSearchStore.setSelectedWorkspaces(selected); };

const handleCheckAll = (val:boolean) => {
    topBarSearchStore.setSelectedWorkspaces(val ? state.workspaces.map((w) => w.value) : []);
};

</script>

<template>
    <p-checkbox-group class="top-bar-search-workspace-filter"
                      direction="vertical"
    >
        <p-checkbox :value="true"
                    :indeterminate="state.isIndeterminate"
                    :selected="state.isAllSelected"
                    @change="handleCheckAll"
        >
            {{ $t('COMMON.NAVIGATIONS.TOP_BAR.ALL_WORKSPACE') }}
        </p-checkbox>
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
</template>

<style scoped lang="scss">
.top-bar-search-workspace-filter {
    @apply pr-3;
    flex: 1 0 13.25rem;
    overflow-y: auto;

    .workspace-item {
        @apply inline-flex items-center gap-1;
        margin-left: 0.125rem;

        .label {
            @apply truncate;
            width: 9.625rem;
        }
    }
}
</style>
