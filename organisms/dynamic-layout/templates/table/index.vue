<template>
    <p-toolbox-table class="p-dynamic-layout-table"
                     :fields="fields"
                     :items="rootData"
                     :loading="loading"
                     :all-page="allPage"
                     :sort-by.sync="sortBy"
                     :sort-desc.sync="sortDesc"
                     :select-index.sync="selectIndex"
                     :this-page.sync="thisPage"
                     :page-size.sync="pageSize"
                     use-cursor-loading
                     :setting-visible="false"
                     sortable
                     :selectable="false"
                     @changePageSize="onChangePageSize"
                     @changePageNumber="onChangePageNumber"
                     @changeSort="onChangeSort"
                     @select="onSelect"
                     @clickRefresh="emitFetch({})"
                     @clickExcel="emitExport()"
    >
        <template #toolbox-top>
            <slot v-if="name" name="toolbox-top">
                <p-panel-top v-if="name" style="margin: 0; margin-top: 0.5rem;"
                             :use-total-count="true"
                             :total-count="totalCount"
                >
                    {{ name }}
                </p-panel-top>
            </slot>
        </template>
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item w-1/2 2xs:hidden lg:block">
                <p-search v-model="searchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex-1 2xs:block lg:hidden mt-4"
                 :class="{'mb-4':$scopedSlots['toolbox-bottom']}"
            >
                <p-search v-model="searchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
            <slot name="toolbox-bottom" />
        </template>
        <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="data">
            <slot :name="slotName" v-bind="data">
                <p-dynamic-field :key="item.name"
                                 v-bind="item"
                                 :data="data.value"
                />
            </slot>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { DynamicField, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { TableDynamicLayoutProps, TableFetchOptions } from '@/components/organisms/dynamic-layout/templates/table/type';
import { get } from 'lodash';

interface Field {
    name: string;
    label: string;
}

const getThisPage = (pageStart = 1, pageLimit = 15) => Math.floor(pageStart / pageLimit) || 1;
export default {
    name: 'PDynamicLayoutTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PSearch,
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
            selectIndex: computed(() => props.extra?.selectIndex || []),
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


        const emitFetch = (options: Partial<TableFetchOptions>) => {
            /*
                check if each option value is 'undefined' to escape auto type casting
                DO NOT use 'state.fetchOptionsParam'. it does not warranty the latest value.
            */
            emit('fetch', {
                sortBy: options.sortBy === undefined ? state.sortBy : options.sortBy,
                sortDesc: options.sortDesc === undefined ? state.sortDesc : options.sortDesc,
                pageStart: options.pageStart === undefined ? state.pageStart : options.pageStart,
                pageLimit: options.pageLimit === undefined ? state.pageSize : options.pageLimit,
                searchText: options.searchText === undefined ? state.searchText : options.searchText,
            } as TableFetchOptions, { ...options });
        };

        const emitExport = () => {
            emit('export', state.fetchOptionsParam, props.options.fields || []);
        };

        const onChangePageSize = (pageLimit: number) => {
            emitFetch({ pageLimit });
        };

        const onChangePageNumber = (pageStart: number) => {
            emitFetch({ pageStart });
        };

        const onChangeSort = (sortBy: string, sortDesc: boolean) => {
            emitFetch({ sortBy, sortDesc });
        };

        const onSelect = (selectIndex: number[]) => {
            state.selectIndex = selectIndex;
            emit('select', selectIndex);
        };

        const onSearch = (val?: string) => {
            emitFetch({ searchText: val || '' });
        };

        emit('init', state.fetchOptionsParam);

        return {
            ...toRefs(state),
            emitFetch,
            emitExport,
            onChangePageSize,
            onChangePageNumber,
            onChangeSort,
            onSelect,
            onSearch,
        };
    },
};
</script>
<style lang="postcss">
.p-dynamic-layout-table {
    border-width: 0;
    .left-toolbox-item {
        &:last-child {
            flex-grow: 1;
        }
    }
    >>> .toolbox {
        .toolbox-bottom {
            @apply mt-0;
        }
    }
}
</style>
