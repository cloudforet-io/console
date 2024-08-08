<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToolboxTable } from '@cloudforet/mirinae';

import WorkspaceGroupTableToolbox from '@/services/advanced/components/WorkspaceGroupTableToolbox.vue';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const tableState = reactive({
    // TODO: temp data
    fields: computed(() => [
        { name: 'name', label: 'Name' },
        { name: 'workspace', label: 'Workspace' },
        { name: 'group_user', label: 'Group User' },
        { name: 'all_users', label: 'All User' },
        { name: 'service_account', label: 'Service Account' },
        { name: 'cost', label: 'Cost' },
        { name: 'created_at', label: 'Created' },
    ]),
    // TODO: temp data
    items: computed(() => [{
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
    }]),
});
</script>

<template>
    <section class="workspace-group-table">
        <p-toolbox-table
            :style="{height: `${props.tableHeight}px`}"
            :fields="tableState.fields"
            :items="tableState.items"
            selectable
            :multi-select="false"
        >
            <template #toolbox-left>
                <workspace-group-table-toolbox />
            </template>
        </p-toolbox-table>
    </section>
</template>
