<template>
    <div class="p-dynamic-layout-table">
        <p-panel-top v-if="layoutName" class="panel-top"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ layoutName }}
        </p-panel-top>
        <p-search-table :fields="fields"
                        :items="rootData"
                        :loading="loading"
                        :total-count="totalCount"
                        :sort-by.sync="sortBy"
                        :sort-desc.sync="sortDesc"
                        :select-index="selectIndex"
                        :this-page.sync="thisPage"
                        :page-size.sync="pageSize"
                        :search-text.sync="searchText"
                        :selectable="selectable"
                        :col-copy="colCopy"
                        :searchable="searchable"
                        :excel-visible="excelVisible"
                        @select="onSelect"
                        @change="onChange"
                        @export="onExport"
        >
            <template v-for="(item, slotName, i) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="slotName"
                                     :type="item.type"
                                     :options="item.options"
                                     :data="data.value"
                                     :type-options="item.typeOptions"
                                     :extra-data="item.extraData"
                                     :before-create="beforeCreateField"
                                     :handler="fieldHandler"
                    />
                </slot>
            </template>
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot v-if="!slot.startsWith('col-')" :name="slot" v-bind="scope" />
            </template>
        </p-search-table>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import PPanelTop from '@/data-display/titles/panel-top/PPanelTop.vue';
import { DynamicFieldProps } from '@/data-display/dynamic/dynamic-field/type';
import {
    TableDynamicLayoutProps,
    TableEventListeners,
    TableFetchOptions,
} from '@/data-display/dynamic/dynamic-layout/templates/table/type';
import { forEach, get } from 'lodash';
import PSearchTable from '@/data-display/tables/search-table/PSearchTable.vue';
import PDynamicField from '@/data-display/dynamic/dynamic-field/PDynamicField.vue';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { getPageStart, getThisPage } from '@/util/helpers';
import { Options } from '@/data-display/tables/query-search-table/type';

const bindExtra = (props: TableDynamicLayoutProps, name: string, init: any) => {
    if (props.typeOptions && props.typeOptions[name]) {
        return computed(() => (props.typeOptions ? props.typeOptions[name] : init));
    }
    return init;
};


export default {
    name: 'PDynamicLayoutTable',
    components: {
        PDynamicField,
        PSearchTable,
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
        beforeCreateField: {
            type: Function,
            default: undefined,
        },
        fieldHandler: {
            type: Function,
            default: undefined,
        },
    },
    setup(props: TableDynamicLayoutProps, { emit }) {
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

            /** get data from typeOptions prop */
            loading: computed(() => (props.typeOptions?.loading || false)),
            totalCount: computed(() => (props.typeOptions?.totalCount || 0)),
            allPage: computed(() => (state.totalCount ? Math.ceil(state.totalCount / state.pageSize) : 1)),
            selectIndex: bindExtra(props, 'selectIndex', []),
            selectable: computed(() => (props.typeOptions?.selectable || false)),
            colCopy: computed(() => (props.typeOptions?.colCopy || false)),
            searchable: computed(() => (props.typeOptions?.searchable === undefined ? true : props.typeOptions.searchable)),
            excelVisible: computed(() => (props.typeOptions?.excelVisible === undefined ? true : props.typeOptions.excelVisible)),

            /** get data from fetch options */
            sortBy: props.fetchOptions?.sortBy || '',
            sortDesc: props.fetchOptions?.sortDesc || true,
            thisPage: getThisPage(props.fetchOptions?.pageStart, props.fetchOptions?.pageLimit),
            pageSize: props.fetchOptions?.pageLimit || 15,
            searchText: props.fetchOptions?.searchText || '',

            /** others */
            pageStart: computed(() => getPageStart(state.thisPage, state.pageSize)),
            rootData: computed<any[]>(() => {
                if (Array.isArray(props.data)) return props.data;
                if (typeof props.data === 'object' && props.options.root_path) {
                    return get(props.data, props.options.root_path, []);
                }
                return [];
            }),
        });

        const dynamicFieldSlots = computed((): Record<string, DynamicFieldProps> => {
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
        });


        const onSelect = (selectIndex: number[]) => {
            if (!props.typeOptions?.selectIndex) state.selectIndex = selectIndex;
            emit('select', selectIndex);
        };

        const onChange = (options: Options, changedOptions: Partial<Options>) => {
            const changedFetchOptions: Partial<TableFetchOptions> = {};

            // apply changed options to state and rename for dynamic fetch options
            forEach(changedOptions, (d, k) => {
                state[k] = d;
                if (k === 'thisPage') changedFetchOptions.pageStart = getPageStart(d as number, changedOptions.pageSize || options.pageSize);
                else if (k === 'pageSize') changedFetchOptions.pageLimit = d as number;
                else changedFetchOptions[k] = d;
            });

            // emit
            const args: Parameters<TableEventListeners['fetch']> = [
                {
                    sortBy: state.sortBy,
                    sortDesc: state.sortDesc,
                    pageStart: state.pageStart,
                    pageLimit: state.pageSize,
                    searchText: state.searchText,
                } as TableFetchOptions, changedFetchOptions,
            ];
            emit('fetch', ...args);
        };

        const onExport = () => {
            emit('export', {
                sortBy: state.sortBy,
                sortDesc: state.sortDesc,
                pageStart: state.pageStart,
                pageLimit: state.pageSize,
                searchText: state.searchText,
            } as TableFetchOptions, props.options.fields || []);
        };


        emit('init', {
            sortBy: state.sortBy,
            sortDesc: state.sortDesc,
            pageStart: state.pageStart,
            pageLimit: state.pageSize,
            searchText: state.searchText,
        } as TableFetchOptions);

        return {
            ...toRefs(state),
            dynamicFieldSlots,
            onSelect,
            onChange,
            onExport,
        };
    },
};
</script>
<style lang="postcss">
.p-dynamic-layout-table {
    .p-search-table {
        height: 100%;
        border-width: 0;
    }
}
</style>
