<template>
    <div>
        <p-panel-top v-if="name"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ name }}
        </p-panel-top>
        <p-data-table :items="rootData"
                      :fields="fields"
                      :loading="loading"
                      v-on="$listeners"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="item.name"
                                     v-bind="item"
                                     :data="data.value"
                                     :before-create="beforeCreateField"
                                     :handler="fieldHandler"
                    />
                </slot>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import {
    SimpleTableDynamicLayoutProps,
    SimpleTableFetchOptions,
} from '@/components/organisms/dynamic-layout/templates/simple-table/type';
import { DynamicField } from '@/components/organisms/dynamic-field/type/field-schema';


export default {
    name: 'PDynamicLayoutSimpleTable',
    components: {
        PDynamicField,
        PDataTable,
        PPanelTop,

    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Array, Object],
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
    setup(props: SimpleTableDynamicLayoutProps, { emit }) {
        const state = reactive({
            fields: computed(() => {
                if (!props.options.fields) return [];

                return props.options.fields.map(ds => ({
                    name: ds.key,
                    label: ds.name,
                    sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
                    // eslint-disable-next-line camelcase
                    sortKey: ds.options?.sort_key,
                    width: ds.options?.width,
                }));
            }),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path);
                }
                return props.data;
            }),
            loading: computed(() => (props.typeOptions?.loading || false)),
            totalCount: computed(() => (props.typeOptions?.totalCount || 0)),
            /** others */
            dynamicFieldSlots: computed((): Record<string, DynamicFieldProps> => {
                const res = {};
                if (!props.options.fields) return res;

                // Do NOT move this code to inside the forEach callback. This code let 'computed' track 'props.typeOptions'.
                const timezone = props.typeOptions?.timezone || 'UTC';

                props.options.fields.forEach((ds: DynamicField, i) => {
                    const item: Omit<DynamicFieldProps, 'data'> = {
                        type: ds.type || 'text',
                        options: ds.options || {},
                        extraData: { ...ds, index: i },
                    };

                    if (ds.type === 'datetime') {
                        item.typeOptions = { timezone };
                    }

                    res[`col-${ds.key}-format`] = item;
                });

                return res;
            }),
            fetchOptionsParam: computed<SimpleTableFetchOptions>(() => ({})),
        });

        emit('init', state.fetchOptionsParam);
        return {
            ...toRefs(state),
        };
    },
};
</script>
