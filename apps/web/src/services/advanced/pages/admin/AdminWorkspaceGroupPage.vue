<script setup lang="ts">
import { onUnmounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PHorizontalLayout } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceGroupListParameters } from '@/schema/identity/workspace-group/api-verbs/list';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import WorkspaceGroupAddUsersModal from '@/services/advanced/components/WorkspaceGroupAddUsersModal.vue';
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
const workspaceGroupPageState = workspaceGroupPageStore.state;

const state = reactive({
    loading: false,
});

const fetchWorkspaceGroups = async () => {
    state.loading = true;

    try {
        // TODO: apply Destructuring
        const results = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>({}) as WorkspaceGroupModel[];

        workspaceGroupPageState.groups = results;
        workspaceGroupPageState.selectedIndices = [];
    } catch (e) {
        ErrorHandler.handleError(e);
        workspaceGroupPageState.groups = [];
    } finally {
        state.loading = false;
    }
};

const initWorkspaceGroups = async () => {
    await fetchWorkspaceGroups();

    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedIndices = [0];
    });
};

(() => {
    initWorkspaceGroups();
})();

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
        <workspace-group-create-modal @confirm="fetchWorkspaceGroups" />
        <workspace-group-edit-modal @confirm="fetchWorkspaceGroups" />
        <workspace-group-delete-modal @confirm="fetchWorkspaceGroups" />
        <workspace-group-delete-status-modal />
        <workspace-group-add-workspaces-modal />
        <workspace-group-add-users-modal />
    </section>
</template>
