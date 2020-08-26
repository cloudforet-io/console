<template>
    <p-text-list :items="data"
                 :delimiter="options.delimiter"
                 :sub-key="options.sub_key"
                 :link="options.link"
    >
        <template #default="{value}">
            <p-dynamic-field />
        </template>
        <template v-if="!delimiter" #delimiter="">
            {{ delimiter }}
        </template>
    </p-text-list>
</template>

<script lang="ts">
import {
    fill, flatten, zip, get,
} from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import PTextList from '@/components/molecules/lists/text-list/PTextList.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import {ListOptions} from "@/components/organisms/dynamic-field/type/field-schema";

export default {
    name: 'PDynamicFieldList',
    components: { PDynamicField, PTextList },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number, null],
            default: null,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: DynamicFieldProps) {
        const listOptions: ListOptions = computed(() => props.options || {}) as ListOptions;

        const state = reactive({
            subKey: computed(() => listOptions.sub_key),
            delimiter: computed(() => listOptions.delimiter),
        });

        return {
            ...toRefs(state),
        };
    },
    // render(h, { props, data: compData }) {
    //     const listOptions: ListOptions = props.options || {};
    //
    //     const options: DynamicFieldOptions = {
    //         ...listOptions.item?.options,
    //     };
    //     if (listOptions.link) options.link = listOptions.link;
    //
    //     const childOptions: Omit<DynamicFieldProps, 'data'> = {
    //         type: listOptions.item ? listOptions.item.type : 'text',
    //         options,
    //         extra: props.extra,
    //     };
    //
    //
    //     let childrenData: any[] = [];
    //
    //     const getValue = (data, paths: string[], results: DynamicFieldProps[]): DynamicFieldProps[] => {
    //         if (Array.isArray(data)) {
    //             data.forEach((v, idx) => {
    //                 getValue(data[idx], paths, results);
    //             });
    //         } else if (typeof data === 'object' && data !== null) {
    //             getValue(data[paths[0]], paths.slice(1), results);
    //         } else if (paths.length === 0 && data !== '' && data !== null && data !== undefined) {
    //             results.push(data);
    //         }
    //
    //         return results;
    //     };
    //     if (listOptions.sub_key) {
    //         childrenData = getValue(props.data, listOptions.sub_key.split('.'), []);
    //     } else {
    //         childrenData = props.data;
    //     }
    //     let children: any[] = [];
    //     if (Array.isArray(childrenData)) {
    //         children = childrenData.map(data => h(PDynamicField, { props: { ...childOptions, data } }));
    //     }
    //
    //
    //     const delimiter = listOptions.delimiter || '<br>';
    //     let delimiterEl;
    //     if (delimiter === '<br>') {
    //         delimiterEl = h('br');
    //     } else {
    //         delimiterEl = h('span', delimiter);
    //     }
    //
    //     if (children.length) {
    //         const dim = fill(Array(children.length - 1), delimiterEl);
    //         children = flatten(zip(children, dim));
    //     }
    //
    //     return h('span', {
    //         ...compData,
    //         class: {
    //             ...getBindClass(compData.class),
    //             'dynamic-layout-list': true,
    //         },
    //     }, children);
    // },
};
</script>

<style lang="postcss">
.dynamic-layout-list {
    line-height: 1.8;
}
</style>
