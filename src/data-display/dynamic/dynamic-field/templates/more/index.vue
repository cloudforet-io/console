<template>
    <span class="p-dynamic-field-more">
        <p-dynamic-field type="text"
                         :data="displayData"
                         :options="nextOptions"
                         @click.native="handleClick"
        />
        <p-dynamic-layout v-if="isInitiated"
                          :type="SUPPORTED_TYPES.includes(layoutSchema.type) ? layoutSchema.type : SUPPORTED_TYPES[0]"
                          :name="layoutSchema.name"
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
import type { PropType } from 'vue';
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import type { MoreDynamicFieldProps, MoreTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/more/type';
import type { MoreOptions, CommonOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';

const PDynamicLayout = () => import('@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue');
const PDynamicField = () => import('@/data-display/dynamic/dynamic-field/PDynamicField.vue');

const SUPPORTED_TYPES = ['popup'];
export default defineComponent<MoreDynamicFieldProps>({
    name: 'PDynamicFieldMore',
    components: { PDynamicLayout, PDynamicField },
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
            displayData: computed(() => (props.typeOptions?.displayKey ? getValueByPath(props.data, props.typeOptions.displayKey) : props.data)),
            subData: computed(() => (props.options?.sub_key ? getValueByPath(props.data, props.options.sub_key) : props.data)),
            isInitiated: false,
            popupVisible: false,
            nextOptions: computed<CommonOptions>(() => {
                const options: Partial<MoreOptions> = { ...props.options };
                delete options.layout;
                delete options.sub_key;
                return options as CommonOptions;
            }),
        });

        const handleClick = () => {
            if (!state.isInitiated) state.isInitiated = true;
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
