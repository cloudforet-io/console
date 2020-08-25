<template>
    <div class="p-dynamic-layout-table">
        <p-panel-top v-if="name" class="panel-top"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ name }}
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
                        :search-text="searchText"
                        :selectable="selectable"
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
        </p-search-table>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { DynamicField, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import {
    TableDynamicLayoutProps,
    TableEventListeners,
    TableFetchOptions,
} from '@/components/organisms/dynamic-layout/templates/table/type';
import { forEach, get } from 'lodash';
import PSearchTable from '@/components/organisms/tables/search-table/PSearchTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';

const bindExtra = (props: TableDynamicLayoutProps, name: string, init: any) => {
    if (props.extra && props.extra[name]) {
        return computed(() => (props.extra ? props.extra[name] : init));
    }
    return init;
};

const getThisPage = (pageStart = 1, pageLimit = 15) => Math.floor(pageStart / pageLimit) || 1;
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
            type: [Array, Object],
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
    setup(props: TableDynamicLayoutProps, { emit, slots }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
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

            /** get data from extra prop */
            loading: computed(() => (props.extra?.loading || false)),
            totalCount: computed(() => (props.extra?.totalCount || 0)),
            allPage: computed(() => (state.totalCount ? Math.ceil(state.totalCount / state.pageSize) : 1)),
            selectIndex: bindExtra(props, 'selectIndex', []),
            selectable: computed(() => (props.extra?.selectable || false)),

            /** get data from fetch options */
            sortBy: props.fetchOptions?.sortBy || '',
            sortDesc: props.fetchOptions?.sortDesc || true,
            thisPage: getThisPage(props.fetchOptions?.pageStart, props.fetchOptions?.pageLimit),
            pageSize: props.fetchOptions?.pageLimit || 15,
            searchText: props.fetchOptions?.searchText || '',

            /** others */
            pageStart: computed(() => ((state.thisPage - 1) * state.pageSize) + 1),
            fetchOptionsParam: computed(() => ({
                sortBy: state.sortBy,
                sortDesc: state.sortDesc,
                pageStart: state.pageStart,
                pageLimit: state.pageSize,
                searchText: state.searchText,
            } as TableFetchOptions)),
            dynamicFieldSlots: computed((): Record<string, DynamicFieldProps> => {
                const res = {};
                if (!props.options.fields) return res;

                props.options.fields.forEach((ds: DynamicField, i) => {
                    const item: Pick<DynamicFieldProps, 'extra'|'options'> = { ...ds, extra: {} as any };

                    if (ds.type === 'datetime') {
                        if (!item.extra.timezone) item.extra.timezone = props.extra?.timezone || 'UTC';
                    }

                    res[`col-${ds.key}-format`] = item;
                });

                return res;
            }),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path, []);
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

        const onChange = (options: TableFetchOptions, changedOptions: Partial<TableFetchOptions>) => {
            const changedFetchOptions: Partial<TableFetchOptions> = {};

            // apply changed options to state and rename for dynamic fetch options
            forEach(changedOptions, (d, k) => {
                state[k] = d;
                if (k === 'thisPage') changedFetchOptions.pageStart = d as number;
                else if (k === 'pageSize') changedFetchOptions.pageLimit = d as number;
                else changedFetchOptions[k] = d;
            });

            // emit
            const args: Parameters<TableEventListeners['fetch']> = [
                state.fetchOptionsParam, changedFetchOptions,
            ];
            emit('fetch', ...args);
        };

        const onExport = () => {
            emit('export', state.fetchOptionsParam, props.options.fields || []);
        };


        emit('init', state.fetchOptionsParam);

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
