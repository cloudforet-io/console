<template>
    <span class="p-dynamic-layout-popup">
        <p-button-modal v-if="state.isInitiated"
                        :header-title="name"
                        :visible="state.popupVisible"
                        hide-footer-close-button
                        @update:visible="handleUpdateVisible"
                        @confirm="handleConfirm"
        >
            <template #body>
                <p-dynamic-layout :type="state.layoutSchema.type"
                                  :options="state.layoutSchema.options"
                                  :data="data"
                />
            </template>
            <template #confirm-button>
                {{ t('COMPONENT.BUTTON_MODAL.CLOSE') }}
            </template>
        </p-button-modal>
    </span>
</template>

<script setup lang="ts">
import {
    computed, defineAsyncComponent, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import type { PopupDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/popup/type';
import type { PopupOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

const PButtonModal = defineAsyncComponent(() => import('@/feedbacks/modals/button-modal/PButtonModal.vue'));

const props = withDefaults(defineProps<PopupDynamicLayoutProps>(), {
    options: () => ({}) as PopupOptions,
});
const emit = defineEmits(['update-popup-visible', 'update-popup-visible']);
const { t } = useI18n();

const state = reactive({
    layoutSchema: computed(() => props.options.layout ?? {}),
    popupVisible: props.typeOptions?.popupVisible,
    isInitiated: props.typeOptions?.popupVisible,
});

const handleUpdateVisible = (popupVisible) => {
    if (!state.isInitiated) state.isInitiated = true;
    state.popupVisible = popupVisible;
    emit('update-popup-visible', popupVisible);
};
const handleConfirm = () => {
    state.popupVisible = false;
    emit('update-popup-visible', false);
};
watch(() => props.typeOptions, (typeOptions) => {
    if (typeOptions?.popupVisible !== state.popupVisible) {
        if (!state.isInitiated) state.isInitiated = true;
        state.popupVisible = typeOptions?.popupVisible;
    }
});

</script>
