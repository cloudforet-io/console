<script setup lang="ts">
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
        <workspace-group-edit-modal />
        <workspace-group-delete-modal />
        <workspace-group-workspace-delete-modal />
        <workspace-group-user-delete-modal />
        <workspace-group-add-workspaces-modal />
        <workspace-group-add-users-modal />
    </section>
</template>
