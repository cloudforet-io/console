<template>
    <div class="p-dynamic-layout-query-search-table">
        <p-panel-top class="panel-top" v-if="name"
                     :use-total-count="true"
                     :total-count="totalCount"
        >
            {{ name }}
        </p-panel-top>
        <p-query-search-table :fields="fields"
                              :items="rootData"
                              :loading="loading"
                              :total-count="totalCount"
                              :sort-by="sortBy"
                              :sort-desc="sortDesc"
                              :select-index="selectIndex"
                              :this-page="thisPage"
                              :page-size="pageSize"
                              :key-items="keyItems"
                              :value-handler-map="valueHandlerMap"
                              :query-tags="queryTags"
                              @select="onSelect"
                              @change="onChange"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="item.name"
                                     v-bind="item"
                                     :data="data.value"
                    />
                </slot>
            </template>
        </p-query-search-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import {
    DynamicLayoutEventListeners,
    DynamicLayoutFetchOptions,
} from '@/components/organisms/dynamic-layout/type';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import {
    Options as QuerySearchTableFetchOptions,
} from '@/components/organisms/tables/query-search-table/type';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicField, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { KeyItem } from '@/components/organisms/search/query-search/type';
import {forEach, get} from 'lodash';
import { QuerySearchDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/query-search-table/type';

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
        loading: {
            type: Boolean,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: undefined,
        },
        timezone: {
            type: String,
            default: undefined,
        },
        initProps: {
            type: Object,
            default: undefined,
        },
    },
    setup(props: QuerySearchDynamicLayoutProps, { emit }) {
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
            sortBy: props.initProps?.sortBy || '',
            sortDesc: props.initProps?.sortDesc || true,
            selectIndex: props.initProps?.selectIndex || [],
            thisPage: props.initProps?.thisPage || 1,
            pageSize: props.initProps?.pageSize || 15,
            keyItems: computed<KeyItem[]>(() => {
                if (props.initProps?.keyItems) return props.initProps?.keyItems;
                if (!props.options.fields) return [];

                return props.options.fields.map(d => ({ label: d.name, name: d.key }));
            }),
            valueHandlerMap: props.initProps?.valueHandlerMap || {},
            queryTags: props.initProps?.queryTags || [],
            /** dynamic layout fetch options */
            fetchOptions: computed<DynamicLayoutFetchOptions>(() => ({
                sortBy: state.sortBy,
                sortDesc: state.sortDesc,
                pageStart: state.thisPage,
                pageLimit: state.pageSize,
                queryTags: state.queryTags,
                selectIndex: state.selectIndex,
            })),
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
                const item = { ...ds, initProps: {} as any };

                if (ds.type === 'datetime') {
                    if (!item.initProps.timezone) item.initProps.timezone = props.timezone || 'UTC';
                }

                res[`col-${ds.key}-format`] = item;
            });

            return res;
        });

        const onSelect = (selectIndex: number[]) => {
            state.selectIndex = selectIndex;
            emit('select', selectIndex);
        };

        const onChange = (options: QuerySearchTableFetchOptions, changedOptions: Partial<QuerySearchTableFetchOptions>) => {
            const changedFetchOptions: Partial<DynamicLayoutFetchOptions> = {};
            forEach(changedOptions, (d, k) => {
                state[k] = d;
                if (k === 'thisPage') changedFetchOptions.pageStart = d as number;
                else if (k === 'pageSize') changedFetchOptions.pageLimit = d as number;
            });

            const args: Parameters<DynamicLayoutEventListeners['fetch']> = [
                state.fetchOptions, changedFetchOptions,
            ];
            emit('fetch', ...args);
        };

        emit('init', state.fetchOptions);


        return {
            ...toRefs(state),
            onChange,
            onSelect,
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
    }
</style>
