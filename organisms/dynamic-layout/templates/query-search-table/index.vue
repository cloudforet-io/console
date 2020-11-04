<template>
    <div class="p-dynamic-layout-query-search-table">
        <p-panel-top v-if="name" class="panel-top"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ name }}
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
                              :key-items="keyItems"
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
            <template v-for="(item, slotName, i) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="i"
                                     v-bind="item"
                                     :data="data.value"
                                     :before-create="beforeCreateField"
                                     :handler="fieldHandler"
                    />
                </slot>
            </template>
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot v-if="!dynamicFieldSlots[slot] && slot !== 'tag-data-type-datetime'" :name="slot" v-bind="scope" />
            </template>
        </p-query-search-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { KeyItem } from '@/components/organisms/search/query-search/type';
import { forEach, get } from 'lodash';
import {
    QuerySearchTableListeners,
    QuerySearchTableDynamicLayoutProps, QuerySearchTableFetchOptions,
} from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { DynamicField } from '@/components/organisms/dynamic-field/type/field-schema';
import { getPageStart } from '@/components/util/helpers';
import { Options } from '@/components/organisms/tables/query-search-table/type';

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

            /** get data from typeOptions prop */
            timezone: computed(() => props.typeOptions?.timezone || 'UTC'),
            loading: computed(() => (props.typeOptions?.loading || false)),
            totalCount: computed(() => (props.typeOptions?.totalCount || 0)),
            keyItems: computed<KeyItem[]>(() => {
                if (props.typeOptions?.keyItems) return props.typeOptions?.keyItems;
                if (!props.options.fields) return [];

                return props.options.fields.map(d => ({ label: d.name, name: d.key }));
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
        });

        const dynamicFieldSlots = computed((): Record<string, DynamicFieldProps> => {
            const res = {};
            if (!props.options.fields) return res;

            props.options.fields.forEach((ds: DynamicField, i) => {
                const item: Omit<DynamicFieldProps, 'data'> = {
                    type: ds.type || 'text',
                    options: ds.options || {},
                    extraData: { ...ds, index: i },
                };

                if (ds.type === 'datetime') {
                    item.typeOptions = { timezone: state.timezone };
                }

                res[`col-${i}-format`] = item;
            });

            return res;
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
            dynamicFieldSlots,
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
