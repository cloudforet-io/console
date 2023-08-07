<template>
    <div>
        <p-heading v-if="state.layoutName"
                   heading-type="sub"
        >
            {{ state.layoutName }}
        </p-heading>
        <p-data-table :items="state.rootData"
                      :fields="state.fields"
                      :loading="state.loading"
                      :col-copy="state.colCopy"
                      v-on="listeners"
        >
            <template v-for="({text, description}, headerSlot) of state.dynamicFieldHeaderSlots"
                      :key="`${headerSlot}-description`"
                      #[headerSlot]
            >
                {{ text }}
                <span class="field-description">{{ description }}</span>
            </template>

            <template v-for="(dynamicField, slotName) of state.dynamicFieldSlots"
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

<script setup lang="ts">
import {
    computed, reactive, useAttrs,
} from 'vue';
import { useI18n } from 'vue-i18n';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    SimpleTableDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/simple-table/type';
import type { SimpleTableOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import type { DataTableField } from '@/data-display/tables/data-table/type';

const props = withDefaults(defineProps<SimpleTableDynamicLayoutProps>(), {
    options: () => ({}) as SimpleTableOptions,
});
const attrs = useAttrs();
const { t } = useI18n();

const state = reactive({
    layoutName: computed(() => (props.options.translation_id ? t(props.options.translation_id) : props.name)),

    /** table */
    fields: computed<DataTableField[]>(() => {
        if (!props.options.fields) return [];

        return props.options.fields.map((ds) => ({
            name: ds.key,
            label: ds.name,
            sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
            sortKey: ds.options?.sort_key,
            width: ds.options?.width,
        } as DataTableField));
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

const listeners = {
    ...attrs,
};

</script>
