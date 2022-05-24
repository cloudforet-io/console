<template>
    <p-dynamic-layout-table class="p-dynamic-layout-raw-table"
                            :name="name"
                            :options="{
                                fields,
                                translation_id: options.translation_id
                            }"
                            :data="rootData"
                            :fetch-options="fetchOptions"
                            :type-options="typeOptions"
                            :field-handler="fieldHandler"
                            v-on="$listeners"
    >
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
        </template>
    </p-dynamic-layout-table>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import { map } from 'lodash';

import { RawTableDynamicLayoutProps } from '@/data-display/dynamic/dynamic-layout/templates/raw-table/type';
import PDynamicLayoutTable from '@/data-display/dynamic/dynamic-layout/templates/table/index.vue';
import { getValueByPath } from '@/data-display/dynamic/helper';


export default {
    name: 'PDynamicLayoutRawTable',
    components: {
        PDynamicLayoutTable,
    },
    props: {
        name: {
            type: String,
            default: '',
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object,
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: undefined,
        },
        fieldHandler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: RawTableDynamicLayoutProps) {
        const state = reactive({
            fields: computed(() => {
                if (state.rootData[0]) {
                    const firstItem = state.rootData[0];
                    return map(firstItem, (d, k) => ({ key: k, name: k }));
                }
                return [];
            }),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    const rootData = getValueByPath(props.data, props.options.root_path) ?? [];
                    return Array.isArray(rootData) ? rootData : [rootData];
                }
                if (Array.isArray(props.data)) return props.data;
                return [];
            }),
        });


        return {
            ...toRefs(state),
        };
    },
};
</script>
