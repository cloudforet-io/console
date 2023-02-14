<template>
    <div>
        <p-heading v-if="layoutName"
                   heading-type="sub"
        >
            {{ layoutName }}
        </p-heading>
        <p-data-table :items="rootData"
                      :fields="fields"
                      :loading="loading"
                      :col-copy="colCopy"
                      v-on="$listeners"
        >
            <template v-for="({text, description}, headerSlot) of dynamicFieldHeaderSlots"
                      #[headerSlot]
            >
                {{ text }}
                <span :key="`${headerSlot}-description`"
                      class="field-description"
                >{{ description }}</span>
            </template>

            <template v-for="(dynamicField, slotName) of dynamicFieldSlots"
                      #[slotName]="slotProps"
            >
                <slot :name="slotName"
                      v-bind="slotProps"
                >
                    <p-dynamic-field :key="slotName"
                                     v-bind="dynamicField"
                                     :data="getFieldData(slotProps.item, slotProps.field.name, dynamicField)"
                                     :handler="fieldHandler"
                    />
                </slot>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    SimpleTableDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/simple-table/type';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';


export default {
    name: 'PDynamicLayoutSimpleTable',
    components: {
        PDynamicField,
        PDataTable,
        PHeading,
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
    setup(props: SimpleTableDynamicLayoutProps) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),

            /** table */
            fields: computed(() => {
                if (!props.options.fields) return [];

                return props.options.fields.map((ds) => ({
                    name: ds.key,
                    label: ds.name,
                    sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
                    sortKey: ds.options?.sort_key,
                    width: ds.options?.width,
                }));
            }),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    const rootData = getValueByPath(props.data, props.options.root_path) ?? [];
                    return Array.isArray(rootData) ? rootData : [rootData];
                }
                if (Array.isArray(props.data)) return props.data;
                return [];
            }),
            /** get data from typeOptions prop */
            timezone: computed(() => props.typeOptions?.timezone || 'UTC'),
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

                props.options.fields.forEach((field: DynamicField, i) => {
                    const item: Omit<DynamicFieldProps, 'data'> = {
                        type: field.type || 'text',
                        options: { ...field.options },
                        extraData: { ...field, index: i },
                    };

                    if (item.options.translation_id) delete item.options.translation_id;

                    if (field.type === 'datetime') {
                        item.typeOptions = { timezone: state.timezone };
                    } else if (field.type === 'more') {
                        item.typeOptions = { displayKey: field.key };
                    }

                    res[`col-${i}-format`] = item;
                });

                return res;
            }),
        });

        const getFieldData = (rowData, dataPath: string, { type }: DynamicFieldProps): any => {
            if (type === 'more') {
                return rowData;
            }
            return getValueByPath(rowData, dataPath);
        };


        return {
            ...toRefs(state),
            getFieldData,
        };
    },
};
</script>
