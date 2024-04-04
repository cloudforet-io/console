<script setup lang="ts">
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

const props = defineProps<{
    visible: boolean
}>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
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
                  @update:visible="emit('update:visible', $event)"
                  @confirm="handleClickConfirm"
    />
</template>
