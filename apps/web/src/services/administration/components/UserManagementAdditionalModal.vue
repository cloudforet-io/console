<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';

const modalSettingStore = useUserModalSettingStore();
const modalSettingState = modalSettingStore.$state;

const state = reactive({
    disabled: false,
});

/* Component */
const handleClose = () => {
    modalSettingStore.$patch((_state) => {
        _state.visible.additional = false;
    });
};
const handleConfirm = () => {
    console.log('confirm');
};
</script>

<template>
    <p-button-modal ref="containerRef"
                    class="user-management-additional-modal"
                    :header-title="modalSettingState.title"
                    size="md"
                    :theme-color="modalSettingState.themeColor"
                    :fade="true"
                    :backdrop="true"
                    :visible="modalSettingState.visible.additional"
                    :disabled="state.disabled"
                    :loading="modalSettingState.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            temp
        </template>
    </p-button-modal>
</template>

<style lang="postcss">
.user-management-additional-modal {
    display: initial;
    .modal-contents {
        @apply bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
    }
}
</style>
