<template>
    <div class="p-dynamic-layout-popup">
        <p-button-modal v-model="modalVisible">
            <template #body>
                <p-dynamic-layout :type="layoutSchema.type"
                                  :options="layoutSchema.options"
                                  :data="data"
                />
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, PropType,
    reactive, toRefs,
} from '@vue/composition-api';

import { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { PopupDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/popup/type';
import { DynamicLayoutFetchOptions, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import { PopupOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';

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
    setup(props) {
        const state = reactive({
            layoutSchema: computed(() => props.options.layout ?? {}),
            modalVisible: true,
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>
