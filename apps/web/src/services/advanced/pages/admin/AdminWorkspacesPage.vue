<script setup lang="ts">
import Vue, {
    computed,
    onMounted, onUnmounted, reactive,
    watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PHeading, PHorizontalLayout, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import WorkspaceManagementTable from '@/services/advanced/components/WorkspaceManagementTable.vue';
import WorkspacesCreateModal from '@/services/advanced/components/WorkspacesCreateModal.vue';
import WorkspacesDeleteModal from '@/services/advanced/components/WorkspacesDeleteModal.vue';
import WorkspacesSetEnableModal from '@/services/advanced/components/WorkspacesSetEnableModal.vue';
import WorkspacesUserManagementTab from '@/services/advanced/components/WorkspacesUserManagementTab.vue';
import { useWorkspaceListQuery } from '@/services/advanced/composables/use-workspace-list-query';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';
import UserManagementAddModal from '@/services/iam/components/UserManagementAddModal.vue';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

const workspacePageStore = useWorkspacePageStore();

const userPageStore = useUserPageStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const { workspaceAPI } = useWorkspaceApi();

const workspaceListQueryHelper = new ApiQueryHelper().setCountOnly();
const { key: workspaceListQueryKey, params: workspaceListQueryParams } = useServiceQueryKey('identity', 'workspace', 'list', {
    params: computed(() => ({
        query: workspaceListQueryHelper.data,
    })),
});
const { workspaceListData } = useWorkspaceListQuery();

const { data: workspaceListQueryData } = useScopedQuery({
    queryKey: workspaceListQueryKey,
    queryFn: async () => workspaceAPI.list(workspaceListQueryParams.value),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
}, ['DOMAIN']);

const route = useRoute();

const modalState = reactive({
    createType: '' as 'CREATE'|'EDIT',
    createModalVisible: false,
    deleteModalVisible: false,
    setEnableModalVisible: false,
    enableState: undefined as undefined| typeof WORKSPACE_STATE[keyof typeof WORKSPACE_STATE],
});

const handleCreateWorkspace = () => {
    modalState.createType = 'CREATE';
    modalState.createModalVisible = true;
};

const handleConfirm = async ({ id, name }: {id: string, name: string}) => {
    userPageStore.$patch((_state) => {
        _state.state.afterWorkspaceCreated = true;
        _state.state.createdWorkspaceId = id;
    });

    userPageStore.updateModalSettings({
        type: USER_MODAL_TYPE.ADD,
        title: i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE', { workspace_name: name }) as string,
        themeColor: 'primary',
        modalVisibleType: 'add',
    });
};

const handleSelectAction = (name: string) => {
    switch (name) {
    case 'edit':
        modalState.createType = 'EDIT';
        modalState.createModalVisible = true;
        break;
    case 'delete':
        modalState.deleteModalVisible = true;
        break;
    case 'enable':
        modalState.enableState = WORKSPACE_STATE.ENABLE;
        modalState.setEnableModalVisible = true;
        break;
    case 'disable':
        if (workspaceListData.value.filter((workspace) => workspace.state === 'ENABLED').length === 1) {
            Vue.notify({
                group: 'toastTopCenter',
                type: 'alert',
                title: i18n.t('IAM.WORKSPACES.REQUIRED_ENABLE_WORKSPACE') as string,
                duration: 2000,
                speed: 1,
            });
        } else {
            modalState.enableState = WORKSPACE_STATE.DISABLE;
            modalState.setEnableModalVisible = true;
        }
        break;
    default: break;
    }
};

watch(() => route.query.modalType, (modalType) => {
    if (modalType) {
        handleSelectAction(modalType as string);
    }
});

onMounted(() => {
    if (route.query.hasNoWorkspace === 'true') {
        handleCreateWorkspace();
    }
});

onUnmounted(() => {
    workspacePageStore.init();
});

</script>

<template>
    <section class="workspaces-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.WORKSPACES.WORKSPACES')"
                           :total-count="workspaceListQueryData?.total_count || 0"
                           use-total-count
                />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateWorkspace"
                >
                    {{ $t('IAM.WORKSPACES.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-horizontal-layout class="workspace-toolbox-layout">
            <template #container="{ height }">
                <workspace-management-table :table-height="height"
                                            :has-read-write-access="hasReadWriteAccess"
                                            @select-action="handleSelectAction"
                />
            </template>
        </p-horizontal-layout>
        <workspaces-user-management-tab :has-read-write-access="hasReadWriteAccess" />
        <workspaces-create-modal
            v-if="hasReadWriteAccess"
            :visible.sync="modalState.createModalVisible"
            :create-type="modalState.createType"
            @confirm="handleConfirm"
        />
        <workspaces-delete-modal v-if="hasReadWriteAccess"
                                 :visible.sync="modalState.deleteModalVisible"
        />
        <workspaces-set-enable-modal v-if="hasReadWriteAccess"
                                     :visible.sync="modalState.setEnableModalVisible"
                                     :enable-modal-type="modalState.enableState"
        />
        <user-management-add-modal v-if="hasReadWriteAccess" />
    </section>
</template>

<style lang="postcss" scoped>
.workspaces-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
