<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToolboxTable, PTooltip, PI } from '@cloudforet/mirinae';

import { gray } from '@/styles/colors';

import WorkspaceGroupTableToolbox from '@/services/advanced/components/WorkspaceGroupTableToolbox.vue';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const state = reactive({
    loading: false,
});

const tableState = reactive({
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'workspace', label: 'Workspace' },
        { name: 'group_user', label: 'Group User' },
        { name: 'created_at', label: 'Created' },
        // TODO: temp data
        // { name: 'all_users', label: 'All User' },
        // { name: 'service_account', label: 'Service Account' },
        // { name: 'cost', label: 'Cost' },
    ],
    items: computed(() => workspaceGroupPageState.groups.map(({
        name, workspaces, users, created_at,
    }) => ({
        name,
        workspace: workspaces.length,
        group_user: users.length,
        created_at,
    }))),
});

const handleUpdateSelectIndex = (indices: number[]) => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedIndices = indices;
    });
};
</script>

<template>
    <section class="workspace-group-table">
        <p-toolbox-table
            :style="{height: `${props.tableHeight}px`}"
            :fields="tableState.fields"
            :items="tableState.items"
            :loading="state.loading"
            :select-index="workspaceGroupPageState.selectedIndices"
            selectable
            sortable
            :multi-select="false"
            @update:select-index="handleUpdateSelectIndex"
        >
            <template #toolbox-left>
                <workspace-group-table-toolbox />
            </template>
            <template #th-cost-format="{ field }">
                <div class="th-tooltip">
                    <span>{{ field.label }}</span>
                    <p-tooltip
                        :contents="$t('IAM.WORKSPACE_GROUP.TOOLTIP_COST')"
                        position="bottom"
                        class="tooltip-wrapper"
                        content-class="custom-tooltip-content"
                    >
                        <p-i name="ic_info-circle"
                             class="title-tooltip"
                             height="1rem"
                             width="1rem"
                             :color="gray[500]"
                        />
                    </p-tooltip>
                </div>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-table {
    border: none;

    .th-tooltip {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip-wrapper {
            margin-top: -0.125rem;
        }
    }
}
</style>
