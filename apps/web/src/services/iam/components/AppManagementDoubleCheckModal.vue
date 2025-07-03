<script setup lang="ts">
import {
    PDoubleCheckModal,
} from '@cloudforet/mirinae';

import type { AppModel } from '@/api-clients/identity/app/schema/model';

import { useAppDeleteMutation } from '@/services/iam/composables/use-app-delete-mutation';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';

interface Props {
    selectedApp: AppModel;
}

const props = withDefaults(defineProps<Props>(), {
    selectedApp: () => ({}) as AppModel,
});

const appPageStore = useAppPageStore();
const appPageState = appPageStore.state;

const { mutate: deleteAppMutate } = useAppDeleteMutation({
    onSettled: () => {
        handleClose();
    },
});

const emit = defineEmits<{(e: 'confirm', value?: AppModel): void;
}>();

/* Component */
const handleClose = () => {
    appPageStore.resetModal();
    emit('confirm');
};

/* API */
const handleConfirm = async () => {
    if (appPageState.modalInfo.type === APP_DROPDOWN_MODAL_TYPE.DELETE) {
        deleteAppMutate({ app_id: props.selectedApp.app_id });
    }
};
</script>

<template>
    <p-double-check-modal class="app-management-double-check-modal"
                          :header-title="appPageState.modalInfo.title"
                          modal-size="sm"
                          :verification-text="props.selectedApp.name"
                          :visible="appPageState.modalVisible.doubleCheck"
                          :loading="appPageState.modalInfo.loading"
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
