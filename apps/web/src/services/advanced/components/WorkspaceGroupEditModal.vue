<script setup lang="ts">
import { onMounted } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupUpdateParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useWorkspaceGroupNameListQuery } from '@/services/advanced/composables/use-workspace-group-name-list-query';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';


const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const { workspaceGroupAPI } = useWorkspaceGroupApi();

const emit = defineEmits<{(e: 'confirm'): void; }>();


const { data: workspaceGroupNameList } = useWorkspaceGroupNameListQuery();
const {
    forms: { groupName }, invalidState, invalidTexts, setForm,
} = useFormValidator({ groupName: '' }, {
    groupName: (value: string) => {
        if (isUpdateWorkspaceGroupPending) return true;
        if (workspaceGroupPageState.selectedWorkspaceGroup?.name === value) {
            return true;
        }
        if (!value?.length) {
            return false;
        }
        if (workspaceGroupNameList.value?.includes(value.trim())) {
            return i18n.t('IAM.WORKSPACE_GROUP.MODAL.CREATE_NAME_INVALID_DUPLICATED');
        }

        return true;
    },
});

const { key: workspaceGroupListBaseQueryKey } = useServiceQueryKey('identity', 'workspace-group', 'list');
const queryClient = useQueryClient();

const { mutateAsync: updateWorkspaceGroupMutation, isPending: isUpdateWorkspaceGroupPending } = useMutation({
    mutationFn: (params: WorkspaceGroupUpdateParameters) => workspaceGroupAPI.update(params),
    onSuccess: async () => {
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_EDIT_WORKSPACE'), '');
        queryClient.invalidateQueries({ queryKey: workspaceGroupListBaseQueryKey.value });
        emit('confirm');
        workspaceGroupPageStore.resetSelectedWorkspace();
        workspaceGroupPageStore.closeModal();
    },
    onError: (e) => {
        ErrorHandler.handleError(e);
    },
});

const handleConfirm = async () => {
    if (!workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id) {
        ErrorHandler.handleError(new Error('workspaceGroupId is not defined'));
        return;
    }
    await updateWorkspaceGroupMutation({
        workspace_group_id: workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id,
        name: groupName.value,
    });
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
};


onMounted(() => {
    setForm('groupName', workspaceGroupPageState.selectedWorkspaceGroup?.name);
});
</script>

<template>
    <p-button-modal class="workspace-group-edit-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.EDIT"
                    :loading="isUpdateWorkspaceGroupPending"
                    :disabled="(groupName === '' || invalidState.groupName)"
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
                    :invalid="invalidState.groupName"
                    :invalid-text="invalidTexts.groupName"
                >
                    <p-text-input :value="groupName"
                                  :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.EDIT_GROUP_NAME_PLACEHOLDER')"
                                  block
                                  @update:value="setForm('groupName', $event)"
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>
