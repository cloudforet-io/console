<script setup lang="ts">

import { onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PButton, PHeading, PHorizontalLayout } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import UserManagementAddModal from '@/services/administration/components/UserManagementAddModal.vue';
import WorkspaceManagementTable from '@/services/administration/components/WorkspaceManagementTable.vue';
import WorkspacesCreateModal from '@/services/administration/components/WorkspacesCreateModal.vue';
import { USER_MODAL_TYPE } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';


const workspacePageStore = useWorkspacePageStore();
const workspaceStore = useWorkspaceStore();
const userPageStore = useUserPageStore();

const route = useRoute();

const state = reactive({
    createModalVisible: false,
    userAddModalVisible: false,
});
const handleCreateWorkspace = () => {
    state.createModalVisible = true;
};

const handleUpdateList = async () => {
    await workspacePageStore.listWorkspaces({});
};

const handleConfirm = async () => {
    await workspaceStore.load();
    userPageStore.$patch((_state) => {
        _state.modal.type = USER_MODAL_TYPE.ADD;
        _state.modal.title = i18n.t('IAM.USER.MAIN.MODAL.CREATE_TITLE') as string;
        _state.modal.themeColor = 'primary';
        _state.afterWorkspaceCreated = true;
        _state.modal.visible.add = true;
        _state.modal = cloneDeep(_state.modal);
    });
};

onMounted(() => {
    if (route.query.hasNoWorkpspace === 'true') {
        handleCreateWorkspace();
    }
});

</script>

<template>
    <section class="workspaces-page">
        <p-heading :title="$t('IAM.WORKSPACES.WORKSPACES')">
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
                <workspace-management-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <workspaces-create-modal :visible.sync="state.createModalVisible"
                                 @refresh="handleUpdateList"
                                 @confirm="handleConfirm"
        />
        <user-management-add-modal />
    </section>
</template>

<style lang="postcss" scoped>
.workspaces-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
