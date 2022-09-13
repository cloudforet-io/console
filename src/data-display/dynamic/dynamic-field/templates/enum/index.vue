<template>
    <p-dynamic-field :type="enumItem.type"
                     :options="enumItem.options"
                     :data="enumItem.name"
                     :type-options="typeOptions"
                     :handler="handler"
                     :extra-data="extraData"
    />
</template>
<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { EnumTypeOptions, EnumDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/enum/type';
import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { EnumItem, EnumOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';

export default defineComponent<EnumDynamicFieldProps>({
    name: 'PDynamicFieldEnum',
    components: { PDynamicField },
    props: {
        options: {
            type: Object as PropType<EnumOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number] as PropType<any>,
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<EnumTypeOptions>,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props) {
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


        return {
            enumItem,
        };
    },
});
</script>
