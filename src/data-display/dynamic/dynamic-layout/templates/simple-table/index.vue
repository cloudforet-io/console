<template>
    <div>
        <p-panel-top v-if="layoutName">
            {{ layoutName }}
        </p-panel-top>
        <p-data-table :items="rootData"
                      :fields="fields"
                      :loading="loading"
                      :col-copy="colCopy"
                      v-on="$listeners"
        >
            <template v-for="({text, description}, headerSlot) of dynamicFieldHeaderSlots" v-slot:[headerSlot]>
                {{ text }}
                <span :key="`${headerSlot}-description`" class="field-description">{{ $t(description) || description }}</span>
            </template>

            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="slotName"
                                     v-bind="item"
                                     :data="getValueByPath(rootData[data.index], data.field.name)"
                                     :handler="fieldHandler"
                    />
                </slot>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { get } from 'lodash';
import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import PPanelTop from '@/data-display/titles/panel-top/PPanelTop.vue';
import { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import {
    SimpleTableDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/simple-table/type';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { getValueByPath } from '@/data-display/dynamic/dynamic-layout/helper';


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
    setup(props: SimpleTableDynamicLayoutProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),

            /** table */
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
                if (Array.isArray(props.data)) return props.data;
                if (typeof props.data === 'object' && props.options.root_path) {
                    return get(props.data, props.options.root_path, []);
                }
                return [];
            }),
            loading: computed(() => (props.typeOptions?.loading || false)),
            colCopy: computed(() => (props.typeOptions?.colCopy || false)),
            /** others */
            dynamicFieldHeaderSlots: computed(() => {
                const headerSlots: any = {};
                if (!Array.isArray(props.options?.fields)) return headerSlots;
                props.options.fields.forEach((d) => {
                    // eslint-disable-next-line camelcase
                    if (d.options?.field_description) {
                        headerSlots[`th-${d.key}-format`] = {
                            text: d.name,
                            description: d.options.field_description,
                        };
                    }
                });
                return headerSlots;
            }),
            dynamicFieldSlots: computed((): Record<string, DynamicFieldProps> => {
                const res = {};
                if (!props.options.fields) return res;

                // Do NOT move this code to inside the forEach callback. This code let 'computed' track 'props.typeOptions'.
                const timezone = props.typeOptions?.timezone || 'UTC';

                props.options.fields.forEach((ds: DynamicField, i) => {
                    const item: Omit<DynamicFieldProps, 'data'> = {
                        type: ds.type || 'text',
                        options: { ...ds.options },
                        extraData: { ...ds, index: i },
                    };

                    if (item.options.translation_id) delete item.options.translation_id;

                    if (ds.type === 'datetime') {
                        item.typeOptions = { timezone };
                    }

                    res[`col-${i}-format`] = item;
                });

                return res;
            }),
        });

        return {
            ...toRefs(state),
            getValueByPath,
        };
    },
};
</script>
