<template>
    <p-text-list :items="items"
                 :delimiter="options.delimiter === undefined ? '<br>' : options.delimiter"
                 :sub-key="options.sub_key"
                 :link="options.link"
    >
        <template #default="{value}">
            <p-dynamic-field :type="options.item ? options.item.type : 'text'"
                             :options="options.item ? options.item.options : undefined"
                             :data="value"
                             :type-options="typeOptions"
                             :extra-data="extraData"
                             :handler="handler"
            />
        </template>
    </p-text-list>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { ListTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/list/type';
import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { ListOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PTextList from '@/data-display/text-list/PTextList.vue';
import { isNotEmpty } from '@/utils/helpers';

export default defineComponent({
    name: 'PDynamicFieldList',
    components: { PDynamicField, PTextList },
    props: {
        options: {
            type: Object as PropType<ListOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        typeOptions: {
            type: Object as PropType<ListTypeOptions>,
            default: () => ({}),
        },
        handler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            items: computed(() => {
                const data = props.data === undefined || props.data === null ? props.options.default : props.data;
                if (Array.isArray(data)) return data;
                if (data instanceof Object && props.options.sub_key) return data;
                return [data];
            }),
        });

        return {
            ...toRefs(state),
            isNotEmpty,
        };
    },
});
</script>

<style lang="postcss">
.dynamic-layout-list {
    line-height: 1.8;
}
</style>
