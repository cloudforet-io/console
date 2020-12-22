<template>
    <p-text-list :items="items"
                 :delimiter="options.delimiter"
                 :sub-key="options.sub_key"
                 :link="options.link"
    >
        <template #default="{value, data}">
            <p-dynamic-field :type="options.item ? options.item.type : 'text'"
                             :options="options.item ? options.item.options : undefined"
                             :data="value"
                             :type-options="typeOptions"
                             :extra-data="extraData"
                             :before-create="beforeCreate"
                             :handler="handler"
            />
        </template>
        <template v-if="!options.delimiter" #delimiter>
            <br>
        </template>
    </p-text-list>
</template>

<script lang="ts">
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PTextList from '@/components/molecules/lists/text-list/PTextList.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { isNotEmpty } from '@/components/util/helpers';
import { ListDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/list/type';

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
        beforeCreate: {
            type: Function,
            default: undefined,
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
