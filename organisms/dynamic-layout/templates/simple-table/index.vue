<template>
    <div>
        <p-panel-top v-if="name"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ name }}
        </p-panel-top>
        <p-data-table v-bind="initProps"
                      :items="rootData"
                      :fields="fields"
                      :loading="loading"
                      v-on="$listeners"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="item.name"
                                     v-bind="item"
                                     :data="data.value"
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
import { DynamicField, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { SimpleTableDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/simple-table/type';
import { DynamicLayoutFetchOptions } from '@/components/organisms/dynamic-layout/type';


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
        loading: {
            type: Boolean,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: undefined,
        },
        timezone: {
            type: String,
            default: undefined,
        },
        initProps: {
            type: Object,
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
            /** others */
            dynamicFieldSlots: computed((): Record<string, DynamicFieldProps> => {
                const res = {};
                if (!props.options.fields) return res;

                props.options.fields.forEach((ds: DynamicField, i) => {
                    const item = { ...ds, initProps: {} as any };

                    if (ds.type === 'datetime') {
                        if (!item.initProps.timezone) item.initProps.timezone = props.timezone || 'UTC';
                    }

                    res[`col-${ds.key}-format`] = item;
                });

                return res;
            }),
            fetchOptions: computed<DynamicLayoutFetchOptions>(() => ({})),
        });

        emit('init', state.fetchOptions);
        return {
            ...toRefs(state),
        };
    },
};
</script>
