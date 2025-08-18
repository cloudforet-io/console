<script setup lang="ts">
import {
    computed, reactive, type ComputedRef,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal, PI } from '@cloudforet/mirinae';


import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupDeleteParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { WORKSPACE_GROUP_MODAL_TYPE, WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const { workspaceGroupAPI } = useWorkspaceGroupApi();

const emit = defineEmits<{(e: 'confirm'): void,
}>();

const state = reactive<{
    sequence: typeof WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE[keyof typeof WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE];
    isDeleteAble: ComputedRef<boolean>;
}>({
    sequence: WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.FIRST,
    isDeleteAble: computed(() => (workspaceGroupPageState.selectedWorkspaceGroup?.workspace_count ?? 0) === 0 && (workspaceGroupPageState.selectedWorkspaceGroup?.users?.length ?? 0) === 0),
});


const { key: workspaceGroupListQueryKey } = useServiceQueryKey('identity', 'workspace-group', 'list');
const queryClient = useQueryClient();
const { mutateAsync: deleteWorkspaceGroupMutation, isPending: isDeleteWorkspaceGroupPending } = useMutation({
    mutationFn: (params: WorkspaceGroupDeleteParameters) => workspaceGroupAPI.delete(params),
    onSuccess: async () => {
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_REMOVE_WORKSPACE_GROUP'), '');
        queryClient.invalidateQueries({ queryKey: workspaceGroupListQueryKey.value });
        workspaceGroupPageStore.reset();
        resetSequence();
        emit('confirm');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_E_REMOVE_WORKSPACE_GROUP'));
    },
});


const resetSequence = () => {
    state.sequence = WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.FIRST;
};

const handleConfirm = async () => {
    if (state.sequence === WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.FIRST) {
        state.sequence = WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.LAST;
        return;
    }
    if (!workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id) {
        ErrorHandler.handleError(new Error('workspaceGroupId is not defined'));
        return;
    }
    await deleteWorkspaceGroupMutation({
        workspace_group_id: workspaceGroupPageState.selectedWorkspaceGroup?.workspace_group_id,
    });
};

const handleCloseModal = () => {
    workspaceGroupPageStore.closeModal();
    resetSequence();
};
</script>

<template>
    <p-button-modal class="workspace-group-delete-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :theme-color="workspaceGroupPageState.modal.themeColor"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.DELETE"
                    :loading="isDeleteWorkspaceGroupPending"
                    :disabled="!state.isDeleteAble"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCloseModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <div v-if="state.sequence === WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.FIRST"
                 class="delete-modal-first-message-wrapper"
            >
                <p>
                    {{ $t('IAM.WORKSPACE_GROUP.MODAL.DELETE_MODAL_FIRST_MESSAGE', {
                        WorkspaceGroupName: workspaceGroupPageState.selectedWorkspaceGroup?.name,
                    }) }}
                </p>
                <div class="count-wrappers">
                    <div class="count-wrapper">
                        <h5 class="count-title">
                            Workspace
                        </h5>
                        <p class="count">
                            {{ workspaceGroupPageState.selectedWorkspaceGroup?.workspace_count || 0 }}
                        </p>
                    </div>
                    <div class="count-wrapper">
                        <h5 class="count-title">
                            Group User
                        </h5>
                        <p class="count">
                            {{ workspaceGroupPageState.selectedWorkspaceGroup?.users?.length || 0 }}
                        </p>
                    </div>
                </div>
                <div v-if="workspaceGroupPageState.selectedWorkspaceGroup?.workspace_count || workspaceGroupPageState.selectedWorkspaceGroup?.users?.length"
                     class="warning-message-wrapper"
                >
                    <div>
                        <p-i name="ic_warning-filled" />
                    </div>
                    {{ $t('IAM.WORKSPACE_GROUP.MODAL.DELETE_MODAL_WARNING_MESSAGE') }}
                </div>
            </div>
            <div v-else>
                {{ $t('IAM.WORKSPACE_GROUP.MODAL.DELETE_MODAL_LAST_MESSAGE') }}
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IAM.WORKSPACE_GROUP.MODAL.DELETE_BUTTON') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspace-group-delete-modal {
    .delete-modal-first-message-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .warning-message-wrapper {
        background: rgba(255, 250, 230, 1);
        padding: 0.5rem 1rem;
        display: flex;
        font-size: 0.875rem;
        line-height: 1.3125rem;

        /* custom design-system component - p-button */
        :deep(.p-button) {
            span {
                height: 1rem;
            }
        }
    }

    /* custom design-system component - p-link */
    :deep(.p-link .p-i-icon) {
        margin: 0;
        width: 1.5rem;
    }

    .count-wrappers {
        display: flex;
        gap: 8px;
    }

    .count-wrapper {
        position: relative;
        border: rgba(221, 221, 223, 1) 1px solid;
        border-radius: 0.375rem;
        padding: 0.75rem 1rem;
        flex-grow: 1;

        .count {
            margin-top: 0.125rem;
        }
    }
}
</style>
