<template>
    <div class="p-dynamic-layout-query-search-table">
        <p-panel-top v-if="layoutName" class="panel-top"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ layoutName }}
        </p-panel-top>
        <p-query-search-table :fields="fields"
                              :items="rootData"
                              :loading="loading"
                              :total-count="totalCount"
                              :sort-by.sync="sortBy"
                              :sort-desc.sync="sortDesc"
                              :select-index="selectIndex"
                              :this-page.sync="thisPage"
                              :page-size.sync="pageSize"
                              :key-item-sets="keyItemSets"
                              :value-handler-map="valueHandlerMap"
                              :query-tags.sync="queryTags"
                              :selectable="selectable"
                              :col-copy="colCopy"
                              :searchable="searchable"
                              :excel-visible="excelVisible"
                              :timezone="timezone"
                              @init="onInit"
                              @change="onChange"
                              @select="onSelect"
                              @export="onExport"
        >
            <template v-for="(item, slotName, i) of dynamicFieldSlots" v-slot:[slotName]="{value, field, index}">
                <p-dynamic-field :key="slotName"
                                 v-bind="item"
                                 :data="value"
                                 :before-create="beforeCreateField"
                                 :handler="fieldHandler"
                />
            </template>
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot v-if="!dynamicFieldSlots[slot] && slot !== 'tag-data-type-datetime'" :name="slot" v-bind="scope" />
            </template>
        </p-query-search-table>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { KeyItemSet } from '@/components/organisms/search/query-search/type';
import { forEach, get } from 'lodash';
import {
    QuerySearchTableListeners,
    QuerySearchTableDynamicLayoutProps, QuerySearchTableFetchOptions,
} from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { getPageStart } from '@/components/util/helpers';
import { Options } from '@/components/organisms/tables/query-search-table/type';
import { DataTableFieldType } from '@/components/organisms/tables/data-table/type';

const getThisPage = (pageStart = 1, pageLimit = 15) => Math.floor(pageStart / pageLimit) || 1;

export default {
    name: 'PDynamicLayoutQuerySearchTable',
    components: {
        PDynamicField,
        PPanelTop,
        PQuerySearchTable,
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
                    title: 'Filters',
                    items: props.options.fields.map(d => ({ label: d.name, name: d.key })),
                }];
            }),
            valueHandlerMap: computed(() => (props.typeOptions?.valueHandlerMap || {})),
            selectIndex: props.typeOptions?.selectIndex ? computed(() => props.typeOptions?.selectIndex) : [],
            selectable: computed(() => (props.typeOptions?.selectable || false)),
            colCopy: computed(() => (props.typeOptions?.colCopy || false)),
            searchable: computed(() => (props.typeOptions?.searchable === undefined ? true : props.typeOptions.searchable)),
            excelVisible: computed(() => (props.typeOptions?.excelVisible === undefined ? true : props.typeOptions.excelVisible)),

            /** get data from fetch options */
            sortBy: props.fetchOptions?.sortBy || '',
            sortDesc: (props.fetchOptions?.sortDesc !== undefined) ? props.fetchOptions.sortDesc : true,
            thisPage: getThisPage(props.fetchOptions?.pageStart, props.fetchOptions?.pageLimit),
            pageSize: props.fetchOptions?.pageLimit || 15,
            queryTags: props.fetchOptions?.queryTags || [],

            /** others */
            pageStart: computed(() => getPageStart(state.thisPage, state.pageSize)),
            fetchOptionsParam: computed(() => ({
                sortBy: state.sortBy,
                sortDesc: state.sortDesc,
                pageStart: state.pageStart,
                pageLimit: state.pageSize,
                queryTags: state.queryTags,
            } as QuerySearchTableFetchOptions)),
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
            emit('export', state.fetchOptionsParam, props.options.fields || []);
        };

        const onInit = (options: Options) => {
            // apply changed options to state.
            forEach(options, (d, k) => {
                state[k] = d;
            });

            emit('init', state.fetchOptionsParam);
        };

        const onChange = (options: Options, changedOptions: Partial<Options>) => {
            const changedFetchOptions: Partial<QuerySearchTableFetchOptions> = {};

            // apply changed options to state and rename for dynamic fetch options
            forEach(changedOptions, (d, k) => {
                state[k] = d;
                if (k === 'thisPage') changedFetchOptions.pageStart = getPageStart(d as number, changedOptions.pageSize || options.pageSize);
                else if (k === 'pageSize') changedFetchOptions.pageLimit = d as number;
                else changedFetchOptions[k] = d;
            });

            // emit
            const args: Parameters<QuerySearchTableListeners['fetch']> = [
                state.fetchOptionsParam, changedFetchOptions,
            ];
            emit('fetch', ...args);
        };


        return {
            ...toRefs(state),
            onInit,
            onChange,
            onSelect,
            onExport,
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
