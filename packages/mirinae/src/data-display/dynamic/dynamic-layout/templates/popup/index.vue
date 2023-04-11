<template>
    <span class="p-dynamic-layout-popup">
        <p-button-modal v-if="isInitiated"
                        :header-title="name"
                        :visible="popupVisible"
                        hide-footer-close-button
                        @update:visible="handleUpdateVisible"
                        @confirm="handleConfirm"
        >
            <template #body>
                <p-dynamic-layout :type="layoutSchema.type"
                                  :options="layoutSchema.options"
                                  :data="data"
                />
            </template>
            <template #confirm-button>
                {{ $t('COMPONENT.BUTTON_MODAL.CLOSE') }}
            </template>
        </p-button-modal>
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import type { PopupDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/popup/type';
import type { DynamicLayoutFetchOptions, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import type { PopupOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';

const PButtonModal = () => import('@/feedbacks/modals/button-modal/PButtonModal.vue');

export default defineComponent<PopupDynamicLayoutProps>({
    name: 'PDynamicLayoutPopup',
    components: {
        PButtonModal,
        PDynamicLayout,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object as PropType<PopupOptions>,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object as PropType<DynamicLayoutFetchOptions|undefined>,
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<DynamicLayoutTypeOptions|undefined>,
            default: undefined,
        },
        fieldHandler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props, { emit }) {
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

        return {
            ...toRefs(state),
            handleUpdateVisible,
            handleConfirm,
        };
    },
});
</script>
