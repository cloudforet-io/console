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
import { computed, reactive, toRefs } from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { ListDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/list/type';
import PTextList from '@/data-display/text-list/PTextList.vue';
import { isNotEmpty } from '@/utils/helpers';

export default {
    name: 'PDynamicFieldList',
    components: { PDynamicField, PTextList },
    props: {
        options: {
            type: Object,
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
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: ListDynamicFieldProps) {
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
};
</script>

<style lang="postcss">
.dynamic-layout-list {
    line-height: 1.8;
}
</style>
