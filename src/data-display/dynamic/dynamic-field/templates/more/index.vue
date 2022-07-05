<template>
    <span class="p-dynamic-field-more">
        <span @click="handleClick">{{ displayData }}</span>
        <p-dynamic-layout :type="SUPPORTED_TYPES.includes(layoutSchema.type) ? layoutSchema.type : SUPPORTED_TYPES[0]"
                          :options="layoutSchema.options"
                          :data="subData"
                          :type-options="{
                              popupVisible
                          }"
                          @update-popup-visible="handleUpdatePopupVisible"
        />
    </span>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, PropType, reactive, toRefs,
} from '@vue/composition-api';

import { MoreDynamicFieldProps, MoreTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/more/type';
import { MoreOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getValueByPath } from '@/data-display/dynamic/helper';

const SUPPORTED_TYPES = ['popup'];
export default defineComponent<MoreDynamicFieldProps>({
    name: 'PDynamicFieldMore',
    components: { PDynamicLayout },
    props: {
        options: {
            type: Object as PropType<MoreOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<MoreTypeOptions>,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            layoutSchema: computed(() => props.options.layout ?? {}),
            popupVisible: false,
            displayData: computed(() => (props.typeOptions?.displayKey ? getValueByPath(props.data, props.typeOptions.displayKey) : props.data)),
            subData: computed(() => (props.options?.sub_key ? getValueByPath(props.data, props.options.sub_key) : props.data)),
        });

        const handleClick = () => {
            state.popupVisible = true;
        };

        const handleUpdatePopupVisible = (popupVisible) => {
            state.popupVisible = popupVisible;
        };

        return {
            ...toRefs(state),
            handleClick,
            handleUpdatePopupVisible,
            SUPPORTED_TYPES,
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-field-more {
    @apply text-blue-700;
    cursor: pointer;
}
</style>
