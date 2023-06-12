<template>
    <p-dynamic-field :type="enumItem.type"
                     :options="enumItem.options"
                     :data="enumItem.name"
                     :type-options="typeOptions"
                     :handler="handler"
                     :extra-data="extraData"
    />
</template>
<script setup lang="ts">
import {
    computed,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { EnumDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/enum/type';
import type { EnumItem } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';

const props = withDefaults(defineProps<EnumDynamicFieldProps>(), {
    options: () => ({}),
    typeOptions: () => ({}),
    extraData: () => ({}),
});

const enumItem = computed<EnumItem>(() => {
    const path = props.data === undefined ? props.options.default : props.data;
    const item = getValueByPath(props.options.items || props.options, path);

    let result;
    if (typeof item === 'string') result = { type: 'text', name: item };
    else if (typeof item === 'object' && item !== null) {
        result = { ...item };
        if (item.name === undefined) result.name = path;
        if (item.type === undefined) result.type = 'text';
    } else {
        result = { type: 'text', name: path };
    }

    return result;
});

</script>
