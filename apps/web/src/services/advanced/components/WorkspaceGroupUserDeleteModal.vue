<script setup lang="ts">
import { reactive, computed, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PLink, PDataTable, PStatus, PFieldTitle, PTooltip, PI,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { WorkspaceGroupUser } from '@/api-clients/identity/workspace-group-user/schema/model';
import type { WorkspaceGroupRemoveUsersParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/remove-users';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { workspaceStateFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceTabState = workspaceGroupPageStore.workspaceTabState;
const userTabState = workspaceGroupPageStore.userTabState;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const allReferenceStore = useAllReferenceStore();

const state = reactive({
    loading: false,
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    isRemoveSingleGroupUserType: computed<boolean>(() => (workspaceGroupPageState.modal.type === WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER)),
    items: computed<WorkspaceGroupUser[]>(() => {
        switch (workspaceGroupPageState.modal.type) {
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_GROUP_USER:
            if (workspaceGroupPageGetters.selectedGroupUsersByIndices.length) {
                return workspaceGroupPageGetters.selectedGroupUsersByIndices;
            }
            return [];
        case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_GROUP_USER:
            return workspaceGroupPageState.modalAdditionalData.selectedGroupUser ? [workspaceGroupPageState.modalAdditionalData.selectedGroupUser] : [];
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
    { name: 'state', label: 'State' }];
const deleteGroupUsers = async () => {
    state.loading = true;

    try {
        const users = state.isRemoveSingleGroupUserType
            ? [workspaceGroupPageState.modalAdditionalData?.selectedGroupUser]
            : workspaceGroupPageGetters.selectedGroupUsersByIndices;
        await SpaceConnector.clientV2.identity.workspaceGroup.removeUsers<WorkspaceGroupRemoveUsersParameters>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroupId,
            users: users.map((item) => ({ user_id: item?.user_id ?? '' })),
        });

        await workspaceGroupPageStore.fetchWorkspaceGroups({ blockSelectedIndicesReset: true });
        await workspaceGroupPageStore.listWorkspaceGroupUsers();
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_REMOVE_USERS'), '');
        userTabState.selectedUserIndices = [];
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_E_REMOVE_USERS'));
    } finally {
        state.loading = false;
    }
};

const getWorkspaceRouteLocationByWorkspaceId = (item) => ({
    name: WORKSPACE_HOME_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const handleConfirm = async () => {
    await deleteGroupUsers();
    await workspaceGroupPageStore.fetchWorkspaceGroups({ blockSelectedIndicesReset: true });

    workspaceGroupPageStore.closeModal();
};

const handleCloseModal = () => {
    workspaceGroupPageStore.closeModal();
    workspaceGroupPageStore.resetSelectedWorkspace();
};
watch(() => workspaceGroupPageGetters.selectedWorkspaceGroupId, (value) => {
    if (value) {
        workspaceGroupPageStore.listWorkspacesInSelectedGroup();
    }
}, { immediate: true });
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
                          :items="workspaceTabState.workspacesInSelectedGroup"
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
