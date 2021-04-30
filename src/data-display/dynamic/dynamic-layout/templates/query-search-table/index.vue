<template>
    <div class="p-dynamic-layout-query-search-table">
        <p-panel-top v-if="layoutName" class="panel-top"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ layoutName }}
        </p-panel-top>
        <p-toolbox-table class="p-query-search-table"
                         search-type="query"
                         :fields="fields"
                         :items="rootData"
                         :loading="loading"
                         :total-count="totalCount"
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :select-index="selectIndex"
                         :page-size.sync="pageSize"
                         :key-item-sets="keyItemSets"
                         :value-handler-map="valueHandlerMap"
                         :query-tags.sync="queryTags"
                         :selectable="selectable"
                         :multi-select="multiSelect"
                         :invalid="invalid"
                         :col-copy="colCopy"
                         :searchable="searchable"
                         :exportable="excelVisible"
                         :settings-visible="settingsVisible"
                         :timezone="timezone"
                         sortable
                         use-cursor-loading
                         @change="onChange"
                         @refresh="onChange()"
                         @select="onSelect"
                         @export="onExport"
                         @click-settings="$emit('click-settings')"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="{field, index}">
                <p-dynamic-field :key="slotName"
                                 v-bind="item"
                                 :data="getValueByPath(rootData[index], field.name)"
                                 :handler="fieldHandler"
                />
            </template>
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot v-if="!dynamicFieldSlots[slot] && slot !== 'tag-data-type-datetime'" :name="slot" v-bind="scope" />
            </template>
        </p-toolbox-table>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PPanelTop from '@/data-display/titles/panel-top/PPanelTop.vue';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import { KeyItemSet } from '@/inputs/search/query-search/type';
import { get } from 'lodash';
import {
    QuerySearchTableDynamicLayoutProps,
} from '@/data-display/dynamic/dynamic-layout/templates/query-search-table/type';
import { Options } from '@/data-display/tables/query-search-table/type';
import { DataTableFieldType } from '@/data-display/tables/data-table/type';
import { getValueByPath } from '@/data-display/dynamic/dynamic-layout/helper';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';


export default {
    name: 'PDynamicLayoutQuerySearchTable',
    components: {
        PDynamicField,
        PPanelTop,
        PToolboxTable,
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
    setup(props: QuerySearchTableDynamicLayoutProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            layoutName: computed(() => (props.options.translation_id ? vm.$t(props.options.translation_id) : props.name)),

            /** table */
            fields: computed<DataTableFieldType[]>(() => {
                if (!props.options.fields) return [];

                return props.options.fields.map(ds => ({
                    name: ds.key,
                    label: ds.name,
                    sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
                    // eslint-disable-next-line camelcase
                    sortKey: ds.options?.sort_key as string,
                    width: ds.options?.width as string,
                }));
            }),

            /** get data from typeOptions prop */
            timezone: computed(() => props.typeOptions?.timezone || 'UTC'),
            loading: computed(() => (props.typeOptions?.loading || false)),
            totalCount: computed(() => (props.typeOptions?.totalCount || 0)),
            keyItemSets: computed<KeyItemSet[]>(() => {
                if (props.typeOptions?.keyItemSets) return props.typeOptions?.keyItemSets;
                if (!props.options.fields) return [];

                return [{
                    title: 'Properties',
                    items: props.options.fields.map(d => ({ label: d.name, name: d.key })),
                }];
            }),
            valueHandlerMap: computed(() => (props.typeOptions?.valueHandlerMap || {})),
            selectIndex: props.typeOptions?.selectIndex ? computed(() => props.typeOptions?.selectIndex) : [],
            selectable: computed(() => (props.typeOptions?.selectable || false)),
            multiSelect: computed(() => (props.typeOptions?.multiSelect === undefined ? true : props.typeOptions.multiSelect)),
            invalid: computed(() => (props.typeOptions?.invalid || false)),
            colCopy: computed(() => (props.typeOptions?.colCopy || false)),
            searchable: computed(() => (props.typeOptions?.searchable === undefined ? true : props.typeOptions.searchable)),
            excelVisible: computed(() => (props.typeOptions?.excelVisible === undefined ? true : props.typeOptions.excelVisible)),
            settingsVisible: computed(() => props.typeOptions?.settingsVisible || false),

            /** get data from fetch options */
            sortBy: props.fetchOptions?.sortBy || '',
            sortDesc: (props.fetchOptions?.sortDesc !== undefined) ? props.fetchOptions.sortDesc : true,
            pageSize: props.fetchOptions?.pageLimit || 15,
            queryTags: props.fetchOptions?.queryTags || [],

            /** others */
            pageStart: 1,
            rootData: computed<any[]>(() => {
                if (Array.isArray(props.data)) return props.data;
                if (typeof props.data === 'object' && props.options.root_path) {
                    return get(props.data, props.options.root_path, []);
                }
                return [];
            }),
            dynamicFieldSlots: computed((): Record<string, DynamicFieldProps> => {
                const res = {};
                if (!state.fields) return res;

                props.options.fields.forEach((field, i) => {
                    const item: Omit<DynamicFieldProps, 'data'> = {
                        type: field.type || 'text',
                        options: { ...field.options },
                        extraData: { ...field, index: i },
                    };

                    if (item.options.translation_id) delete item.options.translation_id;

                    if (field.type === 'datetime') {
                        item.typeOptions = { timezone: state.timezone };
                    }

                    res[`col-${i}-format`] = item;
                });

                return res;
            }),
        });


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

        return {
            ...toRefs(state),
            onChange,
            onSelect,
            onExport,
            getValueByPath,
        };
    },
};
</script>

<style lang="postcss">
.p-dynamic-layout-query-search-table {
    .panel-top {
        margin: 0.5rem 0 0;
    }
    .p-query-search-table {
        height: 100%;
        border-width: 0;
    }
}
</style>
