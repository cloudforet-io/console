<script setup lang="ts">
import { reactive } from 'vue';

import { PToolboxTable, PTooltip, PI } from '@cloudforet/mirinae';

import { gray } from '@/styles/colors';

import WorkspaceGroupTableToolbox from '@/services/advanced/components/WorkspaceGroupTableToolbox.vue';


interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const tableState = reactive({
    // TODO: temp data
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'workspace', label: 'Workspace' },
        { name: 'group_user', label: 'Group User' },
        { name: 'all_users', label: 'All User' },
        { name: 'service_account', label: 'Service Account' },
        { name: 'cost', label: 'Cost' },
        { name: 'created_at', label: 'Created' },
    ],
    // TODO: temp data
    items: [{
        name: 'East Vickyboro',
        workspace: 5,
        group_user: 28,
        all_users: 63,
        service_account: 17,
        cost: 16434,
        created_at: 'yyyy-mm-dd hh:mm:ss',
    },
    {
        name: 'East Vickyboro',
        workspace: 5,
        group_user: 28,
        all_users: 63,
        service_account: 17,
        cost: 16434,
        created_at: 'yyyy-mm-dd hh:mm:ss',
    },
    {
        name: 'East Vickyboro',
        workspace: 5,
        group_user: 28,
        all_users: 63,
        service_account: 17,
        cost: 16434,
        created_at: 'yyyy-mm-dd hh:mm:ss',
    },
    {
        name: 'East Vickyboro',
        workspace: 5,
        group_user: 28,
        all_users: 63,
        service_account: 17,
        cost: 16434,
        created_at: 'yyyy-mm-dd hh:mm:ss',
    },
    {
        name: 'East Vickyboro',
        workspace: 5,
        group_user: 28,
        all_users: 63,
        service_account: 17,
        cost: 16434,
        created_at: 'yyyy-mm-dd hh:mm:ss',
    },
    {
        name: 'East Vickyboro',
        workspace: 5,
        group_user: 28,
        all_users: 63,
        service_account: 17,
        cost: 16434,
        created_at: 'yyyy-mm-dd hh:mm:ss',
    }],
});
</script>

<template>
    <section class="workspace-group-table">
        <p-toolbox-table
            :style="{height: `${props.tableHeight}px`}"
            :fields="tableState.fields"
            :items="tableState.items"
            selectable
            sortable
            :multi-select="false"
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
