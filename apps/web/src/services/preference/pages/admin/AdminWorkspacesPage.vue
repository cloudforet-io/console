<script setup lang="ts">
import Vue, { onMounted, onUnmounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PButton, PHeading, PHorizontalLayout,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';

import UserManagementAddModal from '@/services/iam/components/UserManagementAddModal.vue';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import WorkspaceManagementTable from '@/services/preference/components/WorkspaceManagementTable.vue';
import WorkspacesCreateModal from '@/services/preference/components/WorkspacesCreateModal.vue';
import WorkspacesDeleteModal from '@/services/preference/components/WorkspacesDeleteModal.vue';
import WorkspacesSetEnableModal from '@/services/preference/components/WorkspacesSetEnableModal.vue';
import WorkspacesUserManagementTab from '@/services/preference/components/WorkspacesUserManagementTab.vue';
import { WORKSPACE_STATE } from '@/services/preference/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/preference/store/workspace-page-store';

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;
const userPageStore = useUserPageStore();

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

const refreshWorkspaceList = async () => {
    workspacePageStore.$patch({ loading: true });
    workspaceListApiQueryHelper
        .setPageStart(workspacePageStore.$state.pageStart).setPageLimit(workspacePageStore.$state.pageLimit)
        .setFilters(workspacePageStore.searchFilters);
    try {
        await workspacePageStore.load({ query: workspaceListApiQueryHelper.data });
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
        _state.modal.type = USER_MODAL_TYPE.ADD;
        _state.modal.title = i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE', { workspace_name: name }) as string;
        _state.modal.themeColor = 'primary';
        _state.afterWorkspaceCreated = true;
        _state.createdWorkspaceId = id;
        _state.modal.visible.add = true;
        _state.modal = cloneDeep(_state.modal);
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


const { callApiWithGrantGuard } = useGrantScopeGuard(['DOMAIN'], refreshWorkspaceList);
callApiWithGrantGuard();

onMounted(() => {
    if (route.query.hasNoWorkpspace === 'true') {
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
        <p-heading :title="$t('IAM.WORKSPACES.WORKSPACES')"
                   :total-count="workspacePageState.totalCount"
                   use-total-count
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateWorkspace"
                >
                    {{ $t('IAM.WORKSPACES.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-horizontal-layout class="workspace-toolbox-layout">
            <template #container="{ height }">
                <workspace-management-table :table-height="height"
                                            @select-action="handleSelectAction"
                />
            </template>
        </p-horizontal-layout>
        <workspaces-user-management-tab />
        <workspaces-create-modal
            :visible.sync="modalState.createModalVisible"
            :create-type="modalState.createType"
            @confirm="handleConfirm"
            @refresh="refreshWorkspaceList"
        />
        <workspaces-delete-modal :visible.sync="modalState.deleteModalVisible"
                                 @refresh="refreshWorkspaceList"
        />
        <workspaces-set-enable-modal :visible.sync="modalState.setEnableModalVisible"
                                     :enable-modal-type="modalState.enableState"
                                     @refresh="refreshWorkspaceList"
        />
        <user-management-add-modal @confirm="refreshWorkspaceList" />
    </section>
</template>

<style lang="postcss" scoped>
.workspaces-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
