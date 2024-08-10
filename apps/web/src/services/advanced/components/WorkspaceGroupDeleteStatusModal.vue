<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PTableCheckModal, PLink, PStatus } from '@cloudforet/mirinae';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const state = reactive({
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
    items: computed(() => {
        if (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER) {
            return [{
                // TODO: temp data
                user_id: 'Kara_Herzog@yahoo.com',
                name: ' ',
                state: 'ENABLED',
                group_role_type: 'Member',
            }];
        }

        return [{
            // TODO: temp data
            name: 'cloudone-mz',
            state: 'ENABLED',
            user: 24,
            service_account: 23,
            workspace_id: 'workspace-15fb37788416',
        }];
    }),
});

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

const handleConfirm = () => {
    workspaceGroupPageStore.closeModal();
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
};
</script>

<template>
    <p-table-check-modal class="workspace-group-delete-status-modal"
                         :header-title="workspaceGroupPageState.modal.title"
                         :theme-color="workspaceGroupPageState.modal.themeColor"
                         :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER
                             || workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES"
                         :fields="state.fields"
                         :items="state.items"
                         size="sm"
                         @confirm="handleConfirm"
                         @cancel="handleCancel"
                         @close="handleClose"
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
        <template #col-state-format="{ value }">
            <p-status v-bind="workspaceStateFormatter(value)" />
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

<style lang="postcss">
.workspace-group-delete-status-modal {
    .name-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }
}
</style>
