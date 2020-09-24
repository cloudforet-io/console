<template>
    <p-dynamic-layout-table class="p-dynamic-layout-raw-table"
                            :name="name"
                            :options="{
                                fields
                            }"
                            :data="rootData"
                            :fetch-options="fetchOptions"
                            :type-options="typeOptions"
                            :before-create-field="beforeCreateField"
                            :field-handler="fieldHandler"
                            v-on="$listeners"
    >
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
        </template>
    </p-dynamic-layout-table>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { get, map, forEach } from 'lodash';
import {
    RawTableDynamicLayoutProps,
} from '@/components/organisms/dynamic-layout/templates/raw-table/type';
import PDynamicLayoutTable from '@/components/organisms/dynamic-layout/templates/table/index.vue';


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
        beforeCreateField: {
            type: Function,
            default: undefined,
        },
        fieldHandler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: RawTableDynamicLayoutProps, { emit, listeners }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            fields: computed(() => {
                if (state.rootData[0]) {
                    const firstItem = state.rootData[0];
                    console.debug('fields', firstItem);
                    const res = map(firstItem, (d, k) => ({ key: k, name: k }));
                    console.debug('fields', firstItem, 'res', state.rootData);
                    return res;
                }
                return [];
            }),
            rootData: computed<any[]>(() => {
                if (Array.isArray(props.data)) return props.data;
                if (typeof props.data === 'object' && props.options.root_path) {
                    return get(props.data, props.options.root_path, []);
                }
                return [];
            }),
        });


        return {
            ...toRefs(state),
        };
    },
};
</script>
