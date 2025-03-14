<script setup lang="ts">
import { onUnmounted } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PHorizontalLayout } from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceGroupListParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/list';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
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
import type { WorkspaceGroupFetchParameters } from '@/services/advanced/types/admin-workspace-group-type';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const { hasReadWriteAccess } = usePageEditableStatus();

const workspaceGroupListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(workspaceGroupPageState.pageStart).setPageLimit(workspaceGroupPageState.pageLimit)
    .setSort('name', true);
const workspaceGroupListApiQuery = workspaceGroupListApiQueryHelper.data;

const fetchWorkspaceGroups = async (tabRefresh:WorkspaceGroupFetchParameters = { isGroupUser: false, isWorkspace: false }) => {
    workspaceGroupPageState.loading = true;

    try {
        const { results, total_count } = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>({
            query: workspaceGroupListApiQuery,
        });

        workspaceGroupPageState.workspaceGroups = results || [];
        workspaceGroupPageState.totalCount = total_count ?? 0;

        if (!tabRefresh.isGroupUser && !tabRefresh.isWorkspace) {
            workspaceGroupPageState.selectedIndices = [];
        }

        if (tabRefresh.isGroupUser) {
            workspaceGroupPageStore.userTabState.selectedUserIndices = [];
        }

        if (tabRefresh.isWorkspace) {
            workspaceGroupPageStore.workspaceTabState.selectedWorkspaceIndices = [];
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        workspaceGroupPageState.workspaceGroups = [];
    } finally {
        workspaceGroupPageState.loading = false;
    }
};

const initWorkspaceGroups = async () => {
    await fetchWorkspaceGroups();
};

const refreshTab = async (value:WorkspaceGroupFetchParameters) => {
    await fetchWorkspaceGroups(value);
};

(() => {
    initWorkspaceGroups();
    workspaceGroupPageStore.listRoles();
})();

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
                                       @confirm="fetchWorkspaceGroups"
                />
            </template>
        </p-horizontal-layout>
        <workspace-group-tab v-if="workspaceGroupPageState.selectedIndices.length"
                             @refresh="refreshTab"
        />
        <workspace-group-create-modal v-if="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.CREATE"
                                      @confirm="fetchWorkspaceGroups"
        />
        <workspace-group-edit-modal @confirm="fetchWorkspaceGroups" />
        <workspace-group-delete-modal @confirm="fetchWorkspaceGroups" />
        <workspace-group-workspace-delete-modal />
        <workspace-group-user-delete-modal />
        <workspace-group-add-workspaces-modal />
        <workspace-group-add-users-modal @confirm="() => {refreshTab({isGroupUser: true})}" />
    </section>
</template>
