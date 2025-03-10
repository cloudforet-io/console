<script setup lang="ts">
import Vue, {
    onMounted, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PHeading, PHorizontalLayout, PHeadingLayout,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import WorkspaceManagementTable from '@/services/advanced/components/WorkspaceManagementTable.vue';
import WorkspacesCreateModal from '@/services/advanced/components/WorkspacesCreateModal.vue';
import WorkspacesDeleteModal from '@/services/advanced/components/WorkspacesDeleteModal.vue';
import WorkspacesSetEnableModal from '@/services/advanced/components/WorkspacesSetEnableModal.vue';
import WorkspacesUserManagementTab from '@/services/advanced/components/WorkspacesUserManagementTab.vue';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';
import UserManagementAddModal from '@/services/iam/components/UserManagementAddModal.vue';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;
const userPageStore = useUserPageStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const route = useRoute();

const modalState = reactive({
    createType: '' as 'CREATE'|'EDIT',
    createModalVisible: false,
    deleteModalVisible: false,
    setEnableModalVisible: false,
    enableState: undefined as undefined| typeof WORKSPACE_STATE[keyof typeof WORKSPACE_STATE],
});

const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setSort('name', true);

const refreshWorkspaceList = async (isInit?: boolean) => {
    if (isInit && route.query.selectedWorkspaceId) {
        workspacePageStore.$patch((_state) => {
            _state.searchFilters = [{ k: 'workspace_id', v: route.query.selectedWorkspaceId, o: '=' }];
        });
    }
    workspacePageStore.$patch({ loading: true });
    workspaceListApiQueryHelper
        .setPageStart(workspacePageStore.$state.pageStart).setPageLimit(workspacePageStore.$state.pageLimit)
        .setFilters(workspacePageStore.searchFilters);
    try {
        await workspacePageStore.load({ query: workspaceListApiQueryHelper.data });
        if (isInit) {
            await workspacePageStore.$patch({ selectedIndices: [0] });
            if (route.query.modalType) {
                handleSelectAction(route.query.modalType as string);
            }
        }
    } finally {
        workspacePageStore.$patch({ loading: false });
    }
};

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
        if (workspacePageStore.$state.workspaces.filter((workspace) => workspace.state === 'ENABLED').length === 1) {
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

const { callApiWithGrantGuard } = useGrantScopeGuard(['DOMAIN'], () => refreshWorkspaceList(true));
callApiWithGrantGuard();

onMounted(() => {
    if (route.query.hasNoWorkspace === 'true') {
        handleCreateWorkspace();
    }
});

onUnmounted(() => {
    workspacePageStore.$dispose();
    workspacePageStore.$reset();
});

</script>

<template>
    <section class="workspaces-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.WORKSPACES.WORKSPACES')"
                           :total-count="workspacePageState.totalCount"
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
            @refresh="refreshWorkspaceList"
        />
        <workspaces-delete-modal v-if="hasReadWriteAccess"
                                 :visible.sync="modalState.deleteModalVisible"
                                 @refresh="refreshWorkspaceList"
        />
        <workspaces-set-enable-modal v-if="hasReadWriteAccess"
                                     :visible.sync="modalState.setEnableModalVisible"
                                     :enable-modal-type="modalState.enableState"
                                     @refresh="refreshWorkspaceList"
        />
        <user-management-add-modal v-if="hasReadWriteAccess"
                                   @confirm="refreshWorkspaceList"
        />
    </section>
</template>

<style lang="postcss" scoped>
.workspaces-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
