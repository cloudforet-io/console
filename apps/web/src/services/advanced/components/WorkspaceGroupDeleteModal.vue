<script setup lang="ts">
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PI, PLink, PButton,
} from '@cloudforet/mirinae';

import type { WorkspaceGroupDeleteParameters } from '@/schema/identity/workspace-group/api-verbs/delete';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { WORKSPACE_GROUP_MODAL_TYPE, WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void,
}>();

const state = reactive({
    sequence: 'first',
    loading: false,
});

const deleteWorkspaceGroups = async () => {
    state.loading = true;

    try {
        await SpaceConnector.clientV2.identity.workspaceGroup.delete<WorkspaceGroupDeleteParameters, WorkspaceGroupModel>({
            workspace_group_id: workspaceGroupPageGetters.selectedGroup.workspace_group_id,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

const resetSequence = () => {
    state.sequence = WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.FIRST;
};

const handleConfirm = async () => {
    if (state.sequence === WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.FIRST) {
        state.sequence = WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.LAST;
        return;
    }

    await deleteWorkspaceGroups();
    workspaceGroupPageStore.closeModal();
    resetSequence();
    emit('confirm');
};

const handleCancel = () => {
    workspaceGroupPageStore.closeModal();
    resetSequence();
};

const handleClose = () => {
    workspaceGroupPageStore.closeModal();
    resetSequence();
};
</script>

<template>
    <p-button-modal class="workspace-group-delete-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :theme-color="workspaceGroupPageState.modal.themeColor"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.DELETE"
                    :loading="state.loading"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleClose"
    >
        <template #body>
            <div v-if="state.sequence === WORKSPACE_GROUP_DELETE_MODAL_SEQUENCE.FIRST"
                 class="delete-modal-first-message-wrapper"
            >
                <p>
                    {{ $t('IAM.WORKSPACE_GROUP.MODAL.DELETE_MODAL_FIRST_MESSAGE') }}
                </p>
                <div class="count-wrappers">
                    <div class="count-wrapper">
                        <h5 class="count-title">
                            Workspace
                        </h5>
                        <p class="count">
                            {{ workspaceGroupPageGetters.selectedGroup.workspaces.length || 0 }}
                        </p>
                        <p-button style-type="tertiary"
                                  size="sm"
                                  class="link-button"
                        >
                            <p-link new-tab
                                    action-icon="internal-link"
                                    size="lg"
                            />
                        </p-button>
                    </div>
                    <div class="count-wrapper">
                        <h5 class="count-title">
                            Group User
                        </h5>
                        <p class="count">
                            {{ workspaceGroupPageGetters.selectedGroup.users.length || 0 }}
                        </p>
                        <p-button style-type="tertiary"
                                  size="sm"
                                  class="link-button"
                        >
                            <p-link new-tab
                                    action-icon="internal-link"
                                    size="lg"
                            />
                        </p-button>
                    </div>
                </div>
                <div class="warning-message-wrapper">
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

        .link-button {
            position: absolute;
            top: 0.7rem;
            right: 1rem;
            padding: 0.25rem;
            min-width: 1.5rem;
            max-width: 1.5rem;
        }
    }
}
</style>
