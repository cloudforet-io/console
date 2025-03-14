<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PFieldGroup, PTextInput } from '@cloudforet/mirinae';

import type { WorkspaceGroupUpdateParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/update';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceGroupReferenceMap } from '@/store/reference/workspace-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';


const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;
const allReferenceStore = useAllReferenceStore();

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
    workspaceGroups: computed<WorkspaceGroupReferenceMap>(() => allReferenceStore.getters.workspace_group),
    workspaceGroupNames: computed(() => Object.values(state.workspaceGroups).map((item:any) => item.name)),
});

const {
    forms: { groupName }, invalidState, invalidTexts, setForm,
} = useFormValidator({ groupName: '' }, {
    groupName: (value: string) => {
        if (state.loading) return true;
        if (workspaceGroupPageGetters.selectedWorkspaceGroup.name === value) {
            return true;
        }
        if (!value?.length) {
            return false;
        }
        if (state.workspaceGroupNames.includes(value.trim())) {
            return i18n.t('IAM.WORKSPACE_GROUP.MODAL.CREATE_NAME_INVALID_DUPLICATED');
        }

        return true;
    },
});

const updateWorkspaceGroups = async () => {
    try {
        await SpaceConnector.clientV2.identity.workspaceGroup.update<WorkspaceGroupUpdateParameters, WorkspaceGroupModel>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroup.workspace_group_id,
            name: groupName.value,
        });
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_EDIT_WORKSPACE'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const handleConfirm = async () => {
    state.loading = true;
    await updateWorkspaceGroups();
    workspaceGroupPageStore.closeModal();
    emit('confirm');
    state.loading = false;
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
};


watch(() => workspaceGroupPageState.modal.visible, () => {
    if (workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.EDIT) {
        setForm('groupName', workspaceGroupPageGetters.selectedWorkspaceGroup.name);
    }
});
</script>

<template>
    <p-button-modal class="workspace-group-edit-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.EDIT"
                    :loading="state.loading"
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
