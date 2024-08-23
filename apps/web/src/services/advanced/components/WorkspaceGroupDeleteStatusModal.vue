<script setup lang="ts">
import { reactive, computed } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PTableCheckModal, PLink, PStatus } from '@cloudforet/mirinae';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void,
}>();

const state = reactive({
    loading: false,
    fields: computed(() => {
        const baseFields = [
            { name: 'name', label: 'Name' },
            { name: 'state', lable: 'State' },
        ];
        const [nameField, stateField] = baseFields;

        if (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER) {
            return [
                { name: 'user_id', label: 'User ID' },
                nameField,
                stateField,
                { name: 'group_role_type', label: 'Group Role Type' },
            ];
        }

        return [
            nameField,
            stateField,
            { name: 'user', label: 'User' },
            { name: 'service_account', label: 'Service Account' },
        ];
    }),
});

const getDeleteTableItems = () => {
    if (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER) {
        if (Object.keys(workspaceGroupPageState.selectedGroupUser).length) {
            return [workspaceGroupPageState.selectedGroupUser];
        }

        return workspaceGroupPageGetters.selectedGroupUsersByIndices;
    }

    if (Object.keys(workspaceGroupPageState.selectedWorkspace).length) {
        return [workspaceGroupPageState.selectedWorkspace];
    }

    return workspaceGroupPageGetters.selectedWorkspacesByIndices;
};

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
        await SpaceConnector.clientV2.identity.workspaceGroup.removeUsers({
            worksapce_group_id: workspaceGroupPageGetters.selectedGroup.workspace_group_id,
            workspaces: workspaceGroupPageGetters.selectedGroupUsersByIndices.map((item) => item.name),
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
        await SpaceConnector.clientV2.identity.workspaceGroup.removeWorkspaces({
            worksapce_group_id: workspaceGroupPageGetters.selectedGroup.workspace_group_id,
            workspaces: workspaceGroupPageGetters.selectedWorkspacesByIndices.map((item) => item.name),
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
                             || workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES"
                         :fields="state.fields"
                         :items="getDeleteTableItems()"
                         size="sm"
                         :loading="state.loading"
                         @confirm="handleConfirm"
                         @cancel="handleCloseModal"
                         @close="handleCloseModal"
    >
        <template #col-name-format="{ value, item }">
            <div v-if="workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES"
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
            <p-status v-bind="workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES ? workspaceStateFormatter(value) : groupUserStateFormatter(value)"
                      class="capitalize"
            />
        </template>
        <template #col-user-format="{ value, item }">
            <p-link :text="value"
                    action-icon="internal-link"
                    new-tab
                    :to="getUserRouteLocationByWorkspaceId(item)"
            />
        </template>
        <template #col-service_account-format="{ value, item }">
            <p-link :text="value"
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
