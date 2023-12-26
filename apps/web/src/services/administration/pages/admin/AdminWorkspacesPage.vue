<script setup lang="ts">

import { reactive } from 'vue';

import { PButton, PHeading, PHorizontalLayout } from '@spaceone/design-system';

import WorkspaceManagementTable from '@/services/administration/components/WorkspaceManagementTable.vue';
import WorkspacesCreateModal from '@/services/administration/components/WorkspacesCreateModal.vue';
import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';

const workspacePageStore = useWorkspacePageStore();

const state = reactive({
    createModalVisible: false,
});
const handleCreateWorkspace = () => {
    state.createModalVisible = true;
};

const handleUpdateList = async () => {
    await workspacePageStore.listWorkspaces({});
};
</script>

<template>
    <section class="workspaces-page">
        <p-heading :title="$t('IAM.WORKSPACES.WORKSPACES')">
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateWorkspace"
                >
                    {{ $t('IAM.WORKSPACES.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-horizontal-layout class="workspace-toolbox-layout">
            <template #container="{ height }">
                <workspace-management-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <workspaces-create-modal :visible.sync="state.createModalVisible"
                                 @refresh="handleUpdateList"
        />
    </section>
</template>

<style lang="postcss" scoped>
.workspaces-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
