<script setup lang="ts">
import { reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { WorkspaceGroupUpdateParameters } from '@/schema/identity/workspace-group/api-verbs/update';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';


const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    groupName: '',
    loading: false,
});

const updateWorkspaceGroups = async () => {
    state.loading = true;

    try {
        await SpaceConnector.clientV2.identity.workspaceGroup.update<WorkspaceGroupUpdateParameters, WorkspaceGroupModel>({
            workspace_group_id: workspaceGroupPageGetters.selectedGroup.workspace_group_id,
            name: state.groupName,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

const handleConfirm = async () => {
    await updateWorkspaceGroups();
    workspaceGroupPageStore.closeModal();
    emit('confirm');
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
};


watch(() => workspaceGroupPageState.modal.visible, () => {
    if (workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.EDIT) {
        state.groupName = workspaceGroupPageGetters.selectedGroup.name;
    }
});
</script>

<template>
    <p-button-modal class="workspace-group-edit-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.EDIT"
                    :loading="state.loading"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group
                    required
                    :label="$t('IAM.WORKSPACE_GROUP.MODAL.EDIT_GROUP_NAME')"
                    style-type="secondary"
                >
                    <p-text-input v-model="state.groupName"
                                  :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.EDIT_GROUP_NAME_PLACEHOLDER')"
                                  block
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>
