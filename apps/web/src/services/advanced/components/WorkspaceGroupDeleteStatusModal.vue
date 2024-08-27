<script setup lang="ts">
import { reactive, computed } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PTableCheckModal, PLink, PStatus } from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { WorkspaceGroupRemoveUsersParameters } from '@/schema/identity/workspace-group/api-verbs/remove-users';
import type {
    WorkspaceGroupRemoveWorkspacesParameters,
} from '@/schema/identity/workspace-group/api-verbs/remove-workspaces';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import type { WorkspaceGroupFetchParameters } from '@/services/advanced/types/admin-workspace-group-type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm', option: WorkspaceGroupFetchParameters): void }>();
const allReferenceStore = useAllReferenceStore();

const state = reactive({
    loading: false,
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    isRemoveGroupUserType: computed<boolean>(() => (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER)),
    isRemoveWorkspacesType: computed<boolean>(() => (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES)),
    items: computed(() => {
        switch (workspaceGroupPageState.modal.type) {
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER:
            if (workspaceGroupPageGetters.selectedGroupUsersByIndices.length) {
                return workspaceGroupPageGetters.selectedGroupUsersByIndices;
            }
            return [];
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES:
            return workspaceGroupPageGetters.selectedWorkspacesByIndices?.map((workspace) => ({
                ...state.workspaces[workspace],
            }));
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE:
            return [workspaceGroupPageState.modalAdditionalData.selectedWorkspace];
        default:
            return [];
        }
    }),
});
const userTableFields = [{ name: 'user_id', label: 'User ID' },
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'role_type', label: 'Group Role Type' }];
const workspaceTableField = [{ name: 'name', label: 'Name' },
    { name: 'data.state', label: 'State' },
    { name: 'data.user', label: 'User' },
    { name: 'data.service_account_count', label: 'Service Account' }];


const getWorkspaceRouteLocationByWorkspaceId = (item) => ({
    name: WORKSPACE_HOME_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const getUserRouteLocationByWorkspaceId = (item) => ({
    name: IAM_ROUTE.USER._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const getServiceAccountRouteLocationByWorkspaceId = (item) => ({
    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});


const deleteGroupUsers = async () => {
    state.loading = true;

    try {
        await SpaceConnector.clientV2.identity.workspaceGroup.removeUsers<WorkspaceGroupRemoveUsersParameters>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroup.workspace_group_id,
            users: workspaceGroupPageGetters.selectedGroupUsersByIndices.map((item) => ({ user_id: item.user_id })),
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

const deleteWorkspaces = async () => {
    state.loading = true;

    try {
        await SpaceConnector.clientV2.identity.workspaceGroup.removeWorkspaces<WorkspaceGroupRemoveWorkspacesParameters>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroup.workspace_group_id,
            workspaces: state.isRemoveWorkspacesType ? workspaceGroupPageGetters.selectedWorkspacesByIndices : [workspaceGroupPageState.modalAdditionalData?.selectedWorkspace?.key],
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};


const handleConfirm = async () => {
    if (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER) {
        await deleteGroupUsers();
        workspaceGroupPageStore.resetSelectedGroupUser();
    } else {
        await deleteWorkspaces();
        workspaceGroupPageStore.resetSelectedWorkspace();
    }

    emit('confirm', { isGroupUser: true });
    workspaceGroupPageStore.closeModal();
};

const handleCloseModal = () => {
    workspaceGroupPageStore.closeModal();
    workspaceGroupPageStore.resetSelectedGroupUser();
    workspaceGroupPageStore.resetSelectedWorkspace();
};
</script>

<template>
    <p-table-check-modal class="workspace-group-delete-status-modal"
                         :header-title="workspaceGroupPageState.modal.title"
                         :theme-color="workspaceGroupPageState.modal.themeColor"
                         :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER
                             || workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES
                             || workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE
                         "
                         :fields="state.isRemoveGroupUserType ? userTableFields : workspaceTableField"
                         :items="state.items"
                         size="sm"
                         :loading="state.loading"
                         @confirm="handleConfirm"
                         @cancel="handleCloseModal"
                         @close="handleCloseModal"
    >
        <template #col-name-format="{ value, item }">
            <div v-if="state.isRemoveWorkspacesType"
                 class="name-wrapper"
            >
                <workspace-logo-icon :text="value"
                                     size="xs"
                />
                <p-link :text="value"
                        action-icon="internal-link"
                        new-tab
                        :to="getWorkspaceRouteLocationByWorkspaceId(item)"
                />
            </div>
        </template>
        <template #col-state-format="{ value}">
            <p-status v-bind="state.isRemoveWorkspacesType ? workspaceStateFormatter(value) : groupUserStateFormatter(value)"
                      class="capitalize"
            />
        </template>
        <template #col-role_type-format="{ value }">
            {{ value === ROLE_TYPE.WORKSPACE_OWNER ? 'Owner' : 'Member' }}
        </template>
        <template #col-data.state-format="{ value }">
            <p-status v-bind="workspaceStateFormatter(value)"
                      class="capitalize"
            />
        </template>
        <template #col-data.user-format="{ value, item }">
            <p-link :text="value"
                    action-icon="internal-link"
                    new-tab
                    :to="getUserRouteLocationByWorkspaceId(item)"
            />
        </template>
        <template #col-data.service_account_count-format="{ value, item }">
            <p-link :text="value || 0"
                    action-icon="internal-link"
                    new-tab
                    :to="getServiceAccountRouteLocationByWorkspaceId(item)"
            />
        </template>
    </p-table-check-modal>
</template>

<style lang="postcss" scoped>
.workspace-group-delete-status-modal {
    .name-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}
</style>
