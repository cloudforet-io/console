<script setup lang="ts">
import { reactive, computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PLink, PStatus, PDataTable,
} from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import { sortTableItems } from '@/common/utils/table-sort';

import { useWorkspaceGroupChangeWorkspaceGroupMutation } from '@/services/advanced/composables/querys/use-workspace-group-change-workspace-group-mutation';
import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';


const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceTabState = workspaceGroupPageStore.workspaceTabState;

const state = reactive({
    loading: false,
    isRemoveWorkspacesType: computed<boolean>(() => (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES)),
    isRemoveSingleWorkspaceType: computed<boolean>(() => (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE)),
    items: computed<WorkspaceModel[]>(() => {
        switch (workspaceGroupPageState.modal.type) {
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES:
            return sortTableItems<WorkspaceModel>(workspaceTabState.selectedWorkspaces, state.sortBy, state.sortDesc);
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE:
            return sortTableItems<WorkspaceModel>(workspaceGroupPageState.modalAdditionalData.selectedWorkspace
                ? [workspaceGroupPageState.modalAdditionalData.selectedWorkspace]
                : [], state.sortBy, state.sortDesc);
        default:
            return [];
        }
    }),
    sortBy: 'name',
    sortDesc: false,
});
const workspaceTableField = [{ name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'user_count', label: 'User' },
    { name: 'service_account_count', label: 'Service Account' }];


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
    name: SERVICE_ACCOUNT_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const { changeWorkspaceGroupMutation } = useWorkspaceGroupChangeWorkspaceGroupMutation();
const { key: workspaceGroupListBaseQueryKey } = useServiceQueryKey('identity', 'workspace-group', 'list');
const { key: workspaceListBaseQueryKey } = useServiceQueryKey('identity', 'workspace', 'list');
const queryClient = useQueryClient();

const deleteWorkspaces = async () => {
    state.loading = true;

    try {
        if (state.isRemoveSingleWorkspaceType) {
            if (!workspaceGroupPageState.modalAdditionalData.selectedWorkspace?.workspace_id) throw new Error('Invalid workspace id');
            await changeWorkspaceGroupMutation({
                workspace_id: workspaceGroupPageState.modalAdditionalData.selectedWorkspace?.workspace_id,
            });
        } else {
            await Promise.allSettled(workspaceTabState.selectedWorkspaces.map((item) => changeWorkspaceGroupMutation({
                workspace_id: item.workspace_id,
            })));
        }
        queryClient.invalidateQueries({ queryKey: workspaceGroupListBaseQueryKey.value });
        queryClient.invalidateQueries({ queryKey: workspaceListBaseQueryKey.value });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_REMOVE_WORKSPACES'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_E_REMOVE_WORKSPACES'));
    } finally {
        state.loading = false;
    }
};


const handleConfirm = async () => {
    await deleteWorkspaces();
    workspaceGroupPageStore.resetSelectedWorkspace();
    workspaceGroupPageStore.closeModal();
};

const handleCloseModal = () => {
    workspaceGroupPageStore.closeModal();
};

const handleChangeSort = (sortBy:string, sortDesc:boolean) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
};
</script>

<template>
    <p-button-modal class="workspace-group-delete-status-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :theme-color="workspaceGroupPageState.modal.themeColor"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES
                        || workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE"
                    size="md"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleCloseModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <p-data-table :sortable="true"
                          :items="state.items"
                          :fields="workspaceTableField"
                          :sort-by.sync="state.sortBy"
                          :sort-desc.sync="state.sortDesc"
                          @changeSort="handleChangeSort"
            >
                <template #col-name-format="{ value, item }">
                    <div v-if="state.isRemoveWorkspacesType || state.isRemoveSingleWorkspaceType"
                         class="name-wrapper"
                    >
                        <workspace-logo-icon :text="value"
                                             size="xs"
                                             :theme="item?.tags?.theme"
                        />
                        <p-link :text="value"
                                action-icon="internal-link"
                                new-tab
                                :to="getWorkspaceRouteLocationByWorkspaceId(item)"
                        />
                    </div>
                </template>
                <template #col-state-format="{ value}">
                    <p-status v-bind="workspaceStateFormatter(value)"
                              class="capitalize"
                    />
                </template>
                <template #col-user_count-format="{ value, item }">
                    <p-link :text="value"
                            action-icon="internal-link"
                            new-tab
                            :to="getUserRouteLocationByWorkspaceId(item)"
                    />
                </template>
                <template #col-service_account_count-format="{ value, item }">
                    <p-link :text="value || 0"
                            action-icon="internal-link"
                            new-tab
                            :to="getServiceAccountRouteLocationByWorkspaceId(item)"
                    />
                </template>
            </p-data-table>
        </template>
    </p-button-modal>
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
