<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RoleBindingDeleteParameters } from '@/schema/identity/role-binding/api-verbs/delete';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete<RoleBindingDeleteParameters>({
            role_binding_id: userPageState.selectedRemoveUser.role_binding_id || '',
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_REMOVE_USER'), '');
        emit('confirm');
        handleClose();
    } catch (e) {
        showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_REMOVE_USER'), '');
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.modal.visible.confirm = false;
        _state.modal = cloneDeep(_state.modal);
    });
};
</script>

<template>
    <p-button-modal class="user-management-remove-modal"
                    :header-title="$t('IAM.USER.MAIN.MODAL.REMOVE_WORKSPACE_TITLE')"
                    size="sm"
                    theme-color="alert"
                    fade
                    backdrop
                    :loading="state.loading"
                    :visible="userPageState.modal.visible.confirm"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-body" />
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.user-management-remove-modal {
    .modal-body {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
}

</style>
