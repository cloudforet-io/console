<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PCheckboxGroup, PCheckbox, PTooltip } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;

const state = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
    workspaces: computed(() => state.workspaceList.map((workspace) => ({
        label: workspace.name,
        value: workspace.workspace_id,
        tags: workspace.tags,
    } as { label: string, value: string, tags: { theme: string } | undefined }))),
    selectedWorkspaces: [],
    isAllSelected: computed(() => state.selectedWorkspaces.length === state.workspaces.length),
    isIndeterminate: computed(() => state.selectedWorkspaces.length > 0 && state.selectedWorkspaces.length < state.workspaces.length),
});

const handleSelected = (selected: string[]) => {
    state.selectedWorkspaces = selected;
};

const handleCheckAll = (val) => {
    state.selectedWorkspaces = val ? state.workspaces.map((w) => w.value) : [];
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
            {{ $t('All Workspaces') }}
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
