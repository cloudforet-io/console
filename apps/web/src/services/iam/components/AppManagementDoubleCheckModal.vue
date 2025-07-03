<script setup lang="ts">
import { cloneDeep } from 'lodash';

import {
    PDoubleCheckModal,
} from '@cloudforet/mirinae';

import type { AppModel } from '@/api-clients/identity/app/schema/model';

import { useAppDeleteMutation } from '@/services/iam/composables/use-app-delete-mutation';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';


const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const { mutate: deleteAppMutate } = useAppDeleteMutation({
    onSettled: () => {
        handleClose();
    },
});

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
    if (appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
        deleteAppMutate({ app_id: appPageStore.selectedApp.app_id });
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
