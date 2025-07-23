<script setup lang="ts">
import { reactive, computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PLink, PDataTable, PStatus, PFieldTitle, PTooltip, PI,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { WorkspaceGroupUser } from '@/api-clients/identity/workspace-group-user/schema/model';
import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupRemoveUsersParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/remove-users';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { workspaceStateFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

import { useWorkspaceGroupWorkspaceListQuery } from '../composables/querys/use-workspace-group-workspace-list-query';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const userTabState = workspaceGroupPageStore.userTabState;


const state = reactive({
    loading: false,
    isRemoveSingleGroupUserType: computed<boolean>(() => (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER)),
    items: computed<WorkspaceGroupUser[]>(() => {
        switch (workspaceGroupPageState.modal.type) {
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER:
            if (userTabState.selectedUserIndices.length) {
                return userTabState.selectedUser;
            }
            return [];
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER:
            return workspaceGroupPageState.modalAdditionalData.selectedGroupUser ? [workspaceGroupPageState.modalAdditionalData.selectedGroupUser] : [];
        default:
            return [];
        }
    }),
});
const selectedWorkspaceGroupId = computed<string | undefined>(() => workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id);
const { workspacesInWorkspaceGroup, isLoading: isLoadingWorkspacesInWorkspaceGroup } = useWorkspaceGroupWorkspaceListQuery(selectedWorkspaceGroupId);

const userTableFields = [{ name: 'user_id', label: 'User ID' },
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'role_type', label: 'Group Role Type' }];
const workspaceTableField = [{ name: 'name', label: 'Name' },
    { name: 'state', label: 'State' }];

const queryClient = useQueryClient();
const { key: workspaceGroupListBaseQueryKey } = useServiceQueryKey('identity', 'workspace-group', 'list');
const { key: workspaceGroupListUserQueryKey } = useServiceQueryKey('identity', 'workspace-group-user', 'list');

const { workspaceGroupAPI } = useWorkspaceGroupApi();

const { mutateAsync: removeUsersMutation } = useMutation({
    mutationFn: (params: WorkspaceGroupRemoveUsersParameters) => workspaceGroupAPI.removeUsers(params),
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_E_REMOVE_USERS'));
    },
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_REMOVE_USERS'), '');
        queryClient.invalidateQueries({ queryKey: workspaceGroupListBaseQueryKey.value });
        queryClient.invalidateQueries({ queryKey: workspaceGroupListUserQueryKey.value });
    },
});


const deleteGroupUsers = async () => {
    state.loading = true;

    if (!workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id) {
        ErrorHandler.handleError(new Error('Invalid workspace group id'));
        return;
    }
    const users = state.isRemoveSingleGroupUserType
        ? [workspaceGroupPageState.modalAdditionalData?.selectedGroupUser]
        : userTabState.selectedUser;
    await removeUsersMutation({
        workspace_group_id: workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id,
        users: users.map((item) => ({ user_id: item?.user_id ?? '' })),
    });
    userTabState.selectedUserIndices = [];

    state.loading = false;
};

const getWorkspaceRouteLocationByWorkspaceId = (item) => ({
    name: WORKSPACE_HOME_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const handleConfirm = async () => {
    await deleteGroupUsers();
    workspaceGroupPageStore.resetGroupUser();
    workspaceGroupPageStore.closeModal();
};

const handleCloseModal = () => {
    workspaceGroupPageStore.closeModal();
};
</script>

<template>
    <p-button-modal class="workspace-group-workspace-delete-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :theme-color="workspaceGroupPageState.modal.themeColor"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER
                        || workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER"
                    size="md"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleCloseModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <p class="text-paragraph-lg text-gray-900 mb-4">
                {{ $t('IAM.WORKSPACE_GROUP.MODAL.REMOVE_GROUP_USER_DESCRIPTION') }}
            </p>
            <p-field-title class="mb-2"
                           :label="$t('IAM.WORKSPACE_GROUP.MODAL.REMOVE_GROUP_USER_TITLE')"
            />
            <p-data-table :fields="userTableFields"
                          :items="state.items"
                          class="table-max-height mb-8"
                          bordered
            >
                <template #col-state-format="{ value}">
                    <p-status v-bind="groupUserStateFormatter(value)"
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
            </p-data-table>
            <p-field-title class="mb-2"
                           :label="$t('IAM.WORKSPACE_GROUP.MODAL.ASSOCIATED_WORKSPACES')"
            />
            <p-data-table :fields="workspaceTableField"
                          :items="workspacesInWorkspaceGroup"
                          :loading="isLoadingWorkspacesInWorkspaceGroup"
                          class="table-max-height"
                          bordered
            >
                <template #th-state-format="{ field }">
                    <div class="th-tooltip">
                        <span>{{ field.label }}</span>
                        <p-tooltip
                            :contents="$t('IAM.WORKSPACE_GROUP.TOOLTIP_STATE')"
                            position="bottom"
                            class="tooltip-wrapper"
                            content-class="custom-tooltip-content"
                        >
                            <p-i name="ic_info-circle"
                                 class="title-tooltip"
                                 height="1rem"
                                 width="1rem"
                                 :color="gray[500]"
                            />
                        </p-tooltip>
                    </div>
                </template>
                <template #col-name-format="{ value, item }">
                    <div class="name-wrapper">
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
                    <p-status v-bind="groupUserStateFormatter(value)"
                              class="capitalize"
                    />
                </template>
            </p-data-table>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspace-group-workspace-delete-modal {
    .name-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .th-tooltip {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip-wrapper {
            margin-top: -0.125rem;
        }
    }

    .table-max-height {
        max-height: 11.5rem;
        overflow-y: auto;
    }
}
</style>
