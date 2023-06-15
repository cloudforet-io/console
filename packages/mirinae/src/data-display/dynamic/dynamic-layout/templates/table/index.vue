<template>
    <div class="p-dynamic-layout-table">
        <p-heading v-if="state.layoutName"
                   heading-type="sub"
                   use-total-count
                   :total-count="state.totalCount"
        >
            {{ state.layoutName }}
        </p-heading>
        <p-toolbox-table search-type="plain"
                         :fields="state.fields"
                         :items="state.rootData"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :sort-by="state.sortBy"
                         :sort-desc="state.sortDesc"
                         :select-index="state.selectIndex"
                         :page-size="state.pageSize"
                         :search-text="state.searchText"
                         :selectable="state.selectable"
                         :multi-select="state.multiSelect"
                         :invalid="state.invalid"
                         :col-copy="state.colCopy"
                         :searchable="state.searchable"
                         :exportable="state.excelVisible"
                         :settings-visible="state.settingsVisible"
                         :timezone="state.timezone"
                         :sortable="state.sortable"
                         use-cursor-loading
                         @change="handleChange"
                         @refresh="handleChange()"
                         @select="handleSelect"
                         @export="handleExport"
                         @click-settings="handleClickSettings"
                         @row-left-click="handleClickRow"
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

            <template v-for="(_, slot) of slots"
                      #[slot]="scope"
            >
                <slot v-if="!slot.startsWith('col-')"
                      :name="slot"
                      v-bind="scope"
                />
            </template>
        </p-toolbox-table>
    </div>
</template>

<script setup lang="ts">
/* eslint-disable camelcase */
import {
    computed, reactive, useSlots,
} from 'vue';
import { useI18n } from 'vue-i18n';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    TableDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/table/type';
import type { TableOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';
import type { ToolboxTableOptions } from '@/data-display/tables/toolbox-table/type';

const props = withDefaults(defineProps<TableDynamicLayoutProps>(), {
    options: () => ({}) as TableOptions,
});
const emit = defineEmits(['select', 'export', 'fetch', 'click-row', 'click-settings']);
const slots = useSlots();
const { t } = useI18n();

const state = reactive({
    layoutName: computed(() => (props.options.translation_id ? t(props.options.translation_id) : props.name)),
    /** table */
    fields: computed(() => {
        if (!props.options.fields) return [];

        return props.options.fields.map((ds) => ({
            name: ds.key,
            label: ds.name,
            sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
            // eslint-disable-next-line camelcase
            sortKey: ds.options?.sort_key,
            width: ds.options?.width,
        }));
    }),
    searchable: computed(() => !props.options.disable_search),

    /** get data from typeOptions prop */
    timezone: computed(() => props.typeOptions?.timezone || 'UTC'),
    loading: computed(() => (props.typeOptions?.loading || false)),
    totalCount: computed(() => (props.typeOptions?.totalCount || 0)),
    allPage: computed(() => (state.totalCount ? Math.ceil(state.totalCount / state.pageSize) : 1)),
    selectIndex: props.typeOptions?.selectIndex ? computed(() => props.typeOptions?.selectIndex) : [],
    selectable: computed(() => (props.typeOptions?.selectable || false)),
    multiSelect: computed(() => (props.typeOptions?.multiSelect === undefined ? true : props.typeOptions.multiSelect)),
    invalid: computed(() => (props.typeOptions?.invalid || false)),
    colCopy: computed(() => (props.typeOptions?.colCopy || false)),
    excelVisible: computed(() => (props.typeOptions?.excelVisible === undefined ? true : props.typeOptions.excelVisible)),
    settingsVisible: computed(() => props.typeOptions?.settingsVisible || false),
    sortable: computed(() => (props.typeOptions?.sortable ?? true)),

    /** get data from fetch options */
    sortBy: computed<string>(() => props.fetchOptions?.sortBy ?? props.options.default_sort?.key ?? ''),
    sortDesc: computed<boolean>(() => props.fetchOptions?.sortDesc ?? props.options.default_sort?.desc ?? true),
    pageSize: computed(() => props.fetchOptions?.pageLimit ?? 15),
    searchText: computed(() => props.fetchOptions?.searchText ?? ''),

    /** others */
    pageStart: 1,
    rootData: computed<any[]>(() => {
        if (props.options.root_path) {
            const rootData = getValueByPath(props.data, props.options.root_path) ?? [];
            return Array.isArray(rootData) ? rootData : [rootData];
        }
        if (Array.isArray(props.data)) return props.data;
        return [];
    }),
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
        if (!state.fields) return res;

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

const handleSelect = (selectIndex: number[]) => {
    if (!props.typeOptions?.selectIndex) state.selectIndex = selectIndex;
    emit('select', selectIndex);
};

const handleExport = () => {
    emit('export');
};

const handleChange = (options: ToolboxTableOptions = {}) => {
    emit('fetch', options);
};

const handleClickRow = (_, index) => {
    emit('click-row', index);
};

const handleClickSettings = (event) => {
    emit('click-settings', event);
};

</script>
<style lang="postcss">
.p-dynamic-layout-table {
    .p-toolbox-table {
        height: 100%;
        border-width: 0;
    }
    .field-description {
        @apply text-gray-400;
    }
}
</style>
