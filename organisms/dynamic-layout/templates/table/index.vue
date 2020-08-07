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
                     selectable
                     @changePageSize="onChangePageSize"
                     @changePageNumber="onChangePageNumber"
                     @changeSort="onChangeSort"
                     @select="onSelect"
                     @clickRefresh="emitFetch()"
                     @clickExcel="emitExport()"
    >
        <template #toolbox-top>
            <slot v-if="$scopedSlots['toolbox-top']" name="toolbox-top">
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
    computed, getCurrentInstance, reactive, Ref, toRefs, watch,
} from '@vue/composition-api';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { DynamicField, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { DynamicLayoutFetchOptions } from '@/components/organisms/dynamic-layout/type';
import { TableDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/table/type';
import { get } from 'lodash';

interface Field {
    name: string;
    label: string;
}


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
    setup(props: TableDynamicLayoutProps, { emit, slots }) {
        const vm = getCurrentInstance() as ComponentInstance;

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
            allPage: computed(() => (props.totalCount ? Math.ceil(props.totalCount / state.pageSize) : 1)),
            sortBy: props.initProps?.sortBy || '',
            sortDesc: props.initProps?.sortDesc || true,
            selectIndex: props.initProps?.selectIndex || [],
            thisPage: props.initProps?.thisPage || 1,
            pageSize: props.initProps?.pageSize || 15,
            /** search */
            searchText: props.initProps?.searchText || '',
            /** dynamic layout fetch options */
            fetchOptions: computed(() => ({
                sortBy: state.sortBy,
                sortDesc: state.sortDesc,
                pageStart: state.thisPage,
                pageLimit: state.pageSize,
                selectIndex: state.selectIndex,
                searchText: state.searchText,
            })) as unknown as DynamicLayoutFetchOptions,
            /** others */
            dynamicFieldSlots: computed((): Record<string, DynamicFieldProps> => {
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
            }),
            rootData: computed<any[]>(() => {
                if (props.options.root_path) {
                    return get(props.data, props.options.root_path);
                }
                return props.data;
            }),
        });


        const emitFetch = (options?: Partial<DynamicLayoutFetchOptions>) => {
            emit('fetch', Object.freeze({
                ...state.options,
                ...state.fetchOptions,
            }), Object.freeze({ ...options }));
        };

        const emitExport = () => {
            // emit('export');
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
            state.selectIndex = [...selectIndex];
            emit('select', [...state.selectIndex]);
        };

        const onSearch = (val?: string) => {
            if (val) emitFetch({ searchText: val });
        };

        emit('init', state.fetchOptions);

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
