<script setup lang="ts">
import { computed, onUnmounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PHorizontalLayout } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceGroupListParameters } from '@/schema/identity/workspace-group/api-verbs/list';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
import { store } from '@/store';

import type { PageAccessMap } from '@/lib/access-control/config';

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
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import type { WorkspaceGroupFetchParameters } from '@/services/advanced/types/admin-workspace-group-type';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const route = useRoute();

const workspaceGroupListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(workspaceGroupPageState.pageStart).setPageLimit(workspaceGroupPageState.pageLimit)
    .setSort('name', true);
const workspaceGroupListApiQuery = workspaceGroupListApiQueryHelper.data;

const storeState = reactive({
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
});
const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        return closestRoute?.meta?.menuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
});

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
            workspaceGroupPageState.selectedUserIndices = [];
        }

        if (tabRefresh.isWorkspace) {
            workspaceGroupPageState.selectedWorkspaceIndices = [];
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
        <workspace-group-header :has-read-write-access="state.hasReadWriteAccess" />
        <p-horizontal-layout class="user-group-toolbox-layout">
            <template #container="{ height }">
                <workspace-group-table :table-height="height"
                                       :has-read-write-access="state.hasReadWriteAccess"
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
        <workspace-group-delete-status-modal />
        <workspace-group-add-workspaces-modal />
        <workspace-group-add-users-modal @confirm="() => {refreshTab({isGroupUser: true})}" />
    </section>
</template>
