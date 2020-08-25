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
                              :query-tags="queryTags"
                              @select="onSelect"
                              @change="onChange"
                              @export="onExport"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="item.name"
                                     v-bind="item"
                                     :data="data.value"
                    />
                </slot>
            </template>
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot v-if="!slot.startsWith('col-')" :name="slot" v-bind="scope" />
            </template>
        </p-query-search-table>
    </div>
</template>

<script lang="ts">
import {
    computed, isReactive, isRef, reactive, toRefs,
} from '@vue/composition-api';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicField, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { KeyItem } from '@/components/organisms/search/query-search/type';
import { forEach, get } from 'lodash';
import {
    QuerySearchTableListeners,
    QuerySearchTableDynamicLayoutProps, QuerySearchTableFetchOptions,
} from '@/components/organisms/dynamic-layout/templates/query-search-table/type';

const getThisPage = (pageStart = 1, pageLimit = 15) => Math.floor(pageStart / pageLimit) || 1;

const bindExtra = (props: QuerySearchTableDynamicLayoutProps, name: string, init: any) => {
    if (props.extra && props.extra[name]) {
        return computed(() => (props.extra ? props.extra[name] : init));
    }
    return init;
};
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
            type: Array,
            default: undefined,
        },
        fetchOptions: {
            type: Object,
            default: undefined,
        },
        extra: {
            type: Object,
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
            /** get data from fetch options */
            sortBy: props.fetchOptions?.sortBy || '',
            sortDesc: (props.fetchOptions?.sortDesc !== undefined) ? props.fetchOptions.sortDesc : true,
            thisPage: getThisPage(props.fetchOptions?.pageStart, props.fetchOptions?.pageLimit),
            pageSize: props.fetchOptions?.pageLimit || 15,
            queryTags: props.fetchOptions?.queryTags || [],

            /** get data from extra prop */
            loading: bindExtra(props, 'loading', false),
            totalCount: bindExtra(props, 'totalCount', 0),
            keyItems: computed<KeyItem[]>(() => {
                if (props.extra?.keyItems) return props.extra?.keyItems;
                if (!props.options.fields) return [];

                return props.options.fields.map(d => ({ label: d.name, name: d.key }));
            }),
            valueHandlerMap: bindExtra(props, 'valueHandlerMap', {}),
            selectIndex: bindExtra(props, 'selectIndex', []),

            pageStart: computed(() => ((state.thisPage - 1) * state.pageSize) + 1),
            fetchOptionsParam: computed(() => ({
                sortBy: state.sortBy,
                sortDesc: state.sortDesc,
                pageStart: state.pageStart,
                pageLimit: state.pageSize,
                queryTags: state.queryTags,
            } as QuerySearchTableFetchOptions)),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path);
                }
                return props.data;
            }),
        });

        const dynamicFieldSlots = computed((): Record<string, DynamicFieldProps> => {
            const res = {};
            if (!props.options.fields) return res;

            props.options.fields.forEach((ds: DynamicField, i) => {
                const item: Pick<DynamicFieldProps, 'extra'|'options'> = { ...ds, extra: {} };

                if (ds.type === 'datetime') {
                    if (!item.extra.timezone) item.extra.timezone = props.extra?.timezone || 'UTC';
                }

                res[`col-${ds.key}-format`] = item;
            });

            return res;
        });

        const onSelect = (selectIndex: number[]) => {
            if (!props.extra?.selectIndex) state.selectIndex = selectIndex;
            emit('select', selectIndex);
        };

        const onExport = () => {
            emit('export', state.fetchOptionsParam, props.options.fields || []);
        };

        const onChange = (options: QuerySearchTableFetchOptions, changedOptions: Partial<QuerySearchTableFetchOptions>) => {
            const changedFetchOptions: Partial<QuerySearchTableFetchOptions> = {};

            // apply changed options to state and rename for dynamic fetch options
            forEach(changedOptions, (d, k) => {
                state[k] = d;
                if (k === 'thisPage') changedFetchOptions.pageStart = d as number;
                else if (k === 'pageSize') changedFetchOptions.pageLimit = d as number;
                else changedFetchOptions[k] = d;
            });

            // emit
            const args: Parameters<QuerySearchTableListeners['fetch']> = [
                state.fetchOptionsParam, changedFetchOptions,
            ];
            emit('fetch', ...args);
        };

        emit('init', state.fetchOptionsParam);


        return {
            ...toRefs(state),
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
