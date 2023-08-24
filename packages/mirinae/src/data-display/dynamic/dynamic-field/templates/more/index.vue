<template>
    <span class="p-dynamic-field-more">
        <p-dynamic-field type="text"
                         class="display-data"
                         :data="state.displayData"
                         :options="state.nextOptions"
                         @click="handleClick"
        />
        <p-dynamic-layout v-if="state.isInitiated"
                          :type="SUPPORTED_TYPES.includes(state.layoutSchema.type) ? state.layoutSchema.type : SUPPORTED_TYPES[0]"
                          :name="state.layoutSchema.name"
                          :options="state.layoutSchema.options"
                          :data="state.subData"
                          :type-options="{
                              popupVisible: state.popupVisible
                          }"
                          @update-popup-visible="handleUpdatePopupVisible"
        />
    </span>
</template>

<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { MoreDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/more/type';
import type { MoreOptions, CommonOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getValueByPath } from '@/data-display/dynamic/helper';


const SUPPORTED_TYPES = ['popup'];

const props = withDefaults(defineProps<MoreDynamicFieldProps>(), {
    options: () => ({}) as MoreOptions,
    typeOptions: () => ({}),
    extraData: () => ({}),
});

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

</script>

<style lang="postcss">
.p-dynamic-field-more {
    > .display-data {
        @apply text-blue-700;
        cursor: pointer;
    }
}
</style>
