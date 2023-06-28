<script setup lang="ts">

import { PButtonModal, PI } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

interface Props {
    visible?: boolean;
    manageDisabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();

const { t } = useI18n();

const handleVisibleUpdate = (value: boolean) => {
    emit('update:visible', value);
};

const handleConfirm = () => {
    emit('update:visible', false);
    emit('confirm');
};

</script>

<template>
    <p-button-modal
        class="no-collector-modal"
        :header-title="t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_TITLE')"
        size="md"
        :fade="true"
        :backdrop="true"
        :disabled="props.manageDisabled"
        :visible="props.visible"
        @update:visible="handleVisibleUpdate"
        @confirm="handleConfirm"
    >
        <template #body>
            <p class="modal-content">
                <b>{{ t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_DESC_1') }}</b><br>
                {{ t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_DESC_2') }}
            </p>
        </template>
        <template #confirm-button>
            <p-i class="create-collector-button"
                 width="1.25rem"
                 height="1.25rem"
                 name="ic_plus_bold"
                 color="inherit"
            />{{ t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_CREATE_COLLECTOR') }}
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.no-collector-modal {
    .modal-content {
        line-height: 1.5rem;
    }
    .modal-button {
        .create-collector-button {
            padding: 0;
            margin-right: 0.3125rem;
        }
    }
}
</style>
