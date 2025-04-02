<script setup lang="ts">
import { reactive, computed } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PTableCheckModal, PLink, PStatus } from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { MyWorkspaceGroupModel } from '@/api-clients/identity/user-profile/schema/model';
import type { WorkspaceGroupUserRemoveParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/remove';
import type { WorkspaceUser, WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { workspaceStateFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

const emit = defineEmits<{(e: 'confirm'): void;
    (e: 'update:visible'): void;
}>();

interface Props {
    workspaceGroup?: WorkspaceGroupModel | MyWorkspaceGroupModel
    removeUserList?: WorkspaceUser[]
    visible: boolean;
}

const props = defineProps<Props>();

const userWorkspaceGroupStore = useUserWorkspaceGroupStore();
const landingPageStore = useLandingPageStore();
const landingPageStoreState = landingPageStore.state;
const landingPageStoreGroupUserState = landingPageStore.groupUserTableState;

const allReferenceStore = useAllReferenceStore();

const state = reactive({
    loading: false,
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    proxyVisible: useProxyValue('visible', props, emit),
});
const userTableFields = [{ name: 'user_id', label: 'User ID' },
    { name: 'user_name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'role_type', label: 'Group Role Type' }];

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


const deleteGroupUsers = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.workspaceGroupUser.remove<WorkspaceGroupUserRemoveParameters>({
            workspace_group_id: landingPageStoreState.selectedWorkspaceGroup,
            users: (props.removeUserList ?? []).map((item) => ({ user_id: item.user_id })),
        });
        await userWorkspaceGroupStore.load();
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_REMOVE_USERS'), '');
        landingPageStoreGroupUserState.selectedIndices = [];
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_E_REMOVE_USERS'));
    } finally {
        state.loading = false;
    }
};

const handleConfirm = async () => {
    await deleteGroupUsers();
    state.proxyVisible = false;
    emit('confirm');
};

const handleCloseModal = () => {
    state.proxyVisible = false;
};
</script>

<template>
    <p-table-check-modal class="workspace-group-delete-status-modal"
                         :header-title="$t('IAM.WORKSPACE_GROUP.MODAL.DELETE_GROUP_USER_TITLE')"
                         theme-color="alert"
                         :visible="state.proxyVisible"
                         :fields="userTableFields"
                         :items="props.removeUserList || []"
                         size="sm"
                         :loading="state.loading"
                         @confirm="handleConfirm"
                         @cancel="handleCloseModal"
                         @close="handleCloseModal"
    >
        <template #col-state-format="{ value}">
            <p-status v-bind=" groupUserStateFormatter(value)"
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
