<script setup lang="ts">
import { onUnmounted } from 'vue';

import { PHorizontalLayout } from '@cloudforet/mirinae';

import WorkspaceGroupAddWorkspacesModal from '@/services/advanced/components/WorkspaceGroupAddWorkspacesModal.vue';
import WorkspaceGroupCreateModal from '@/services/advanced/components/WorkspaceGroupCreateModal.vue';
import WorkspaceGroupDeleteModal from '@/services/advanced/components/WorkspaceGroupDeleteModal.vue';
import WorkspaceGroupDeleteStatusModal from '@/services/advanced/components/WorkspaceGroupDeleteStatusModal.vue';
import WorkspaceGroupEditModal from '@/services/advanced/components/WorkspaceGroupEditModal.vue';
import WorkspaceGroupHeader from '@/services/advanced/components/WorkspaceGroupHeader.vue';
import WorkspaceGroupTab from '@/services/advanced/components/WorkspaceGroupTab.vue';
import WorkspaceGroupTable from '@/services/advanced/components/WorkspaceGroupTable.vue';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();

onUnmounted(() => {
    workspaceGroupPageStore.$dispose();
    workspaceGroupPageStore.$reset();
});
</script>

<template>
    <section class="workspace-group-page">
        <workspace-group-header />
        <p-horizontal-layout class="user-group-toolbox-layout">
            <template #container="{ height }">
                <workspace-group-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <workspace-group-tab />
        <workspace-group-create-modal />
        <workspace-group-edit-modal />
        <workspace-group-delete-modal />
        <workspace-group-delete-status-modal />
        <workspace-group-add-workspaces-modal />
    </section>
</template>
