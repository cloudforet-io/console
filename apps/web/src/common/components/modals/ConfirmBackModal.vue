<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';

defineProps<{
    visible: boolean
}>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();
const handleClickConfirm = () => {
    emit('update:visible', false);
    emit('confirm');
};
const handleUpdateVisible = (value: boolean) => {
    emit('update:visible', value);
};
</script>

<template>
    <delete-modal class="confirm-back-modal"
                  :header-title="t('COMMON.CONFIRM_BACK_MODAL.TITLE')"
                  :visible="visible"
                  :contents="t('COMMON.CONFIRM_BACK_MODAL.CANNOT_CANCEL')"
                  @update:visible="handleUpdateVisible"
                  @confirm="handleClickConfirm"
    />
</template>
