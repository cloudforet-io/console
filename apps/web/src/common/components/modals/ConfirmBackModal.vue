<script setup lang="ts">
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

const props = defineProps<{
    visible: boolean;
    hideCloseButton?: boolean;
}>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
    (e: 'close'): void;
    (e: 'cancel'): void;
}>();
const handleClickConfirm = () => {
    emit('update:visible', false);
    emit('confirm');
};
</script>

<template>
    <delete-modal class="confirm-back-modal"
                  :header-title="$t('COMMON.CONFIRM_BACK_MODAL.TITLE')"
                  :visible="props.visible"
                  :contents="$t('COMMON.CONFIRM_BACK_MODAL.CANNOT_CANCEL')"
                  :hide-close-button="props.hideCloseButton"
                  @update:visible="emit('update:visible', $event)"
                  @confirm="handleClickConfirm"
                  @close="emit('close')"
                  @cancel="emit('cancel')"
    />
</template>
