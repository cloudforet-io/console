<script setup lang="ts">
import { onUnmounted } from 'vue';

import { PHorizontalLayout } from '@cloudforet/mirinae';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import WorkspaceGroupAddUsersModal from '@/services/advanced/components/WorkspaceGroupAddUsersModal.vue';
import WorkspaceGroupAddWorkspacesModal from '@/services/advanced/components/WorkspaceGroupAddWorkspacesModal.vue';
import WorkspaceGroupCreateModal from '@/services/advanced/components/WorkspaceGroupCreateModal.vue';
import WorkspaceGroupDeleteModal from '@/services/advanced/components/WorkspaceGroupDeleteModal.vue';
import WorkspaceGroupEditModal from '@/services/advanced/components/WorkspaceGroupEditModal.vue';
import WorkspaceGroupHeader from '@/services/advanced/components/WorkspaceGroupHeader.vue';
import WorkspaceGroupTab from '@/services/advanced/components/WorkspaceGroupTab.vue';
import WorkspaceGroupTable from '@/services/advanced/components/WorkspaceGroupTable.vue';
import WorkspaceGroupUserDeleteModal from '@/services/advanced/components/WorkspaceGroupUserDeleteModal.vue';
import WorkspaceGroupWorkspaceDeleteModal from '@/services/advanced/components/WorkspaceGroupWokrspaceDeleteModal.vue';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const { hasReadWriteAccess } = usePageEditableStatus();

onUnmounted(() => {
    workspaceGroupPageStore.$dispose();
    workspaceGroupPageStore.reset();
});

</script>

<template>
    <section class="workspace-group-page">
        <workspace-group-header :has-read-write-access="hasReadWriteAccess" />
        <p-horizontal-layout class="user-group-toolbox-layout">
            <template #container="{ height }">
                <workspace-group-table :table-height="height"
                                       :has-read-write-access="hasReadWriteAccess"
                />
            </template>
        </p-horizontal-layout>
        <workspace-group-tab v-if="workspaceGroupPageState.selectedIndices.length" />
        <workspace-group-create-modal v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.CREATE" />
        <workspace-group-edit-modal v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.EDIT" />
        <workspace-group-delete-modal v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.DELETE" />
        <workspace-group-workspace-delete-modal
            v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES ||
                workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE"
        />
        <workspace-group-user-delete-modal
            v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER ||
                workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER"
        />
        <workspace-group-add-workspaces-modal v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES" />
        <workspace-group-add-users-modal v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS" />
    </section>
</template>
