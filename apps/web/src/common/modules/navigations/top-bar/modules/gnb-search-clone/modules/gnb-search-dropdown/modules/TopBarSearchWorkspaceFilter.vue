<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PCheckboxGroup, PCheckbox, PTooltip } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useTopBarSearchStore } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/store';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreState = userWorkspaceStore.$state;
const topBarSearchStore = useTopBarSearchStore();

const state = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => [...workspaceStoreState.getters.workspaceList]),
    workspaces: computed(() => state.workspaceList.map((workspace) => ({
        label: workspace.name,
        value: workspace.workspace_id,
        tags: workspace.tags,
    } as { label: string, value: string, tags: { theme: string } | undefined }))),
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
