<script setup lang="ts">
import {
    PDoubleCheckModal,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import type { AppModel } from '@/schema/identity/app/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { APP_DROPDOWN_MODAL_TYPE } from '@/services/administration/constants/app-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';


const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const emit = defineEmits<{(e: 'confirm', value?: AppModel): void;
}>();

/* Component */
const handleClose = () => {
    appPageStore.$patch((_state) => {
        _state.modal.type = '';
        _state.modal.visible.doubleCheck = false;
        _state.modal = cloneDeep(_state.modal);
    });
    emit('confirm');
};

/* API */
const handleConfirm = async () => {
    try {
        if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
            await appPageStore.deleteApp({ app_id: appPageStore.selectedApp.app_id });
        }
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    } finally {
        handleClose();
    }
};
</script>

<template>
    <p-double-check-modal class="app-management-double-check-modal"
                          :header-title="appPageState.modal.title"
                          modal-size="sm"
                          :verification-text="appPageStore.selectedApp.name"
                          :visible="appPageState.modal.visible.doubleCheck"
                          :loading="appPageState.modal.loading"
                          @confirm="handleConfirm"
                          @cancel="handleClose"
    >
        <template #middle-contents>
            <p class="description">
                {{ $t('IAM.APP.MODAL.DELETE_DESC') }}
            </p>
        </template>
    </p-double-check-modal>
</template>

<style lang="postcss">
.app-management-double-check-modal {
    .description {
        @apply text-paragraph-lg;
        padding-bottom: 1.5rem;
    }
}
</style>
