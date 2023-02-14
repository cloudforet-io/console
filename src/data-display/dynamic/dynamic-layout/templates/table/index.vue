<template>
    <div class="p-dynamic-layout-table">
        <p-heading v-if="layoutName"
                   heading-type="sub"
                   use-total-count
                   :total-count="totalCount"
        >
            {{ layoutName }}
        </p-heading>
        <p-toolbox-table search-type="plain"
                         :fields="fields"
                         :items="rootData"
                         :loading="loading"
                         :total-count="totalCount"
                         :sort-by="sortBy"
                         :sort-desc="sortDesc"
                         :select-index="selectIndex"
                         :page-size="pageSize"
                         :search-text="searchText"
                         :selectable="selectable"
                         :multi-select="multiSelect"
                         :invalid="invalid"
                         :col-copy="colCopy"
                         :searchable="searchable"
                         :exportable="excelVisible"
                         :settings-visible="settingsVisible"
                         :timezone="timezone"
                         :sortable="sortable"
                         use-cursor-loading
                         @change="onChange"
                         @refresh="onChange()"
                         @select="onSelect"
                         @export="onExport"
                         @click-settings="$emit('click-settings')"
                         @rowLeftClick="onClickRow"
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

            <template v-for="(_, slot) of $scopedSlots"
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

<script lang="ts">
/* eslint-disable camelcase */
import type { PropType } from 'vue';
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';

import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import type { DynamicFieldHandler, DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import type { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    TableDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/table/type';
import type { DynamicLayoutFetchOptions, DynamicLayoutTypeOptions } from '@/data-display/dynamic/dynamic-layout/type';
import type { TableOptions } from '@/data-display/dynamic/dynamic-layout/type/layout-schema';
import { getValueByPath } from '@/data-display/dynamic/helper';
import PHeading from '@/data-display/heading/PHeading.vue';
import type { Options } from '@/data-display/tables/query-search-table/type';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';

export default defineComponent<TableDynamicLayoutProps>({
    name: 'PDynamicLayoutTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PHeading,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object as PropType<TableOptions>,
            default: () => ({}),
        },
        data: {
            type: [Object, Array, String],
            default: undefined,
        },
        fetchOptions: {
            type: Object as PropType<DynamicLayoutFetchOptions|undefined>,
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<DynamicLayoutTypeOptions|undefined>,
            default: undefined,
        },
        fieldHandler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props, { emit }) {
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
            sortBy: computed(() => props.fetchOptions?.sortBy || ''),
            sortDesc: computed(() => props.fetchOptions?.sortDesc || true),
            pageSize: computed(() => props.fetchOptions?.pageLimit || 15),
            searchText: computed(() => props.fetchOptions?.searchText || ''),

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

        const onSelect = (selectIndex: number[]) => {
            if (!props.typeOptions?.selectIndex) state.selectIndex = selectIndex;
            emit('select', selectIndex);
        };

        const onExport = () => {
            emit('export');
        };

        const onChange = (options: Options = {}) => {
            emit('fetch', options);
        };

        const onClickRow = (_, index) => {
            emit('click-row', index);
        };

        return {
            ...toRefs(state),
            onChange,
            onSelect,
            onExport,
            getFieldData,
            onClickRow,
        };
    },
});
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
