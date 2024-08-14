<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const state = reactive({
    groupName: '',
    loading: false,
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
                    <p-text-input :value="state.groupName"
                                  :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.EDIT_GROUP_NAME_PLACEHOLDER')"
                                  block
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>
