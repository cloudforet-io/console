<template>
    <p-toolbox-table class="p-query-search-table"
                     :fields="fields"
                     :items="items"
                     :loading="loading"
                     :all-page="allPage"
                     :sort-by.sync="proxySortBy"
                     :sort-desc.sync="proxySortDesc"
                     :select-index.sync="proxySelectIndex"
                     :this-page.sync="proxyThisPage"
                     :page-size.sync="proxyPageSize"
                     use-cursor-loading
                     sortable
                     v-on="$listeners"
    >
        <!--        @changePageSize="getData"-->
        <!--        @changePageNumber="getData"-->
        <!--        @clickRefresh="getData"-->
        <!--        @changeSort="getData"-->
        <!--        @clickExcel="exportExcel"-->

        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search v-model="searchText"
                                :key-items="keyItems"
                                @search="onSearch"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex flex-col flex-1">
                <p-query-search v-model="searchText"
                                class="block lg:hidden mt-4"
                                :class="{ 'mb-4': !!$scopedSlots['toolbox-bottom'] && tags.length === 0}"
                                :key-items="keyItems"
                                @search="onSearch"
                />
                <div v-if="tags.length > 0" class="mt-4" :class="{ 'mb-4': $scopedSlots['toolbox-bottom']}">
                    <p-hr style="width: 100%;" />
                    <p-query-search-tags style="margin-top: 0.5rem;"
                                         :tags="tags"
                                         @delete:tag="deleteTag"
                                         @delete:all="deleteAllTags"
                    />
                </div>
                <slot name="toolbox-bottom" />
            </div>
        </template>
        <template v-for="name in slotNames" v-slot:[name]="data">
            <slot :name="name" v-bind="data" />
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';
import {
    computed, getCurrentInstance, reactive, Ref, toRefs,
} from '@vue/composition-api';
import { debounce, forEach, isEqual } from 'lodash';
import {
    KeyItem, QueryItem, QuerySearchListeners, ValueItem,
} from '@/components/organisms/search/query-search/type';
import {
    QuerySearchTagsListeners,
    QueryTag,
} from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';
import { makeOptionalProxy, makeProxy } from '@/components/util/composition-helpers';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

export default {
    name: 'PQuerySearchTable',
    components: {
        PQuerySearchTags, PHr, PQuerySearch, PToolboxTable,
    },
    props: {
        fields: {
            type: Array,
            default: () => ([]),
        },
        items: {
            type: Array,
            default: () => ([]),
        },
        loading: {
            type: Boolean,
            default: false,
        },
        sortBy: {
            type: String,
            default: '',
        },
        sortDesc: {
            type: Boolean,
            default: true,
        },
        selectIndex: {
            type: Array,
            default: () => [],
        },
        thisPage: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 15,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        keyHandler: {
            type: Function,
            default: () => {
                //
            },
        },
        valueHandlerMap: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: QuerySearchTableProps, { slots, emit, listeners }) {
        const vm = getCurrentInstance() as ComponentInstance;
        const tableState = reactive({
            allPage: computed(() => Math.ceil(props.totalCount / props.pageSize) || 1),
            proxySortBy: makeOptionalProxy('sortBy', vm),
            proxySortDesc: makeOptionalProxy('sortDesc', vm),
            proxySelectIndex: makeOptionalProxy('selectIndex', vm),
            proxyThisPage: makeOptionalProxy('thisPage', vm),
            proxyPageSize: makeOptionalProxy('pageSize', vm),
        });

        const state = reactive({
            searchText: '',
            keyItems: [] as KeyItem[],
            valueItems: [] as ValueItem[],
            searchLoading: false,
            searchTotalCount: 0,
            tags: [] as QueryTag[],
            slotNames: computed(() => {
                const res: string[] = [];
                forEach(slots, (func, name) => {
                    if (!['toolbox-left', 'toolbox-bottom'].includes(name)) res.push(name);
                });
                return res;
            }),
        });

        const validation = (query: QueryItem): boolean => (state.tags as unknown as QueryTag[]).every((tag) => {
            if (tag.key && query.key) {
                return (query.key.name !== tag.key.name
                    || query.operator !== tag.operator
                    || query.value !== tag.value);
            }
            if (!tag.key && !query.key) {
                return query.value !== tag.value;
            }
            return true;
        });

        const onSearch = async (query: QueryItem) => {
            if (!validation(query)) return;
            // @ts-ignore
            state.tags = [...state.tags, query];
        };


        const deleteTag = (idx: number) => {
            state.tags.splice(idx, 1);
        };

        const deleteAllTags = () => {
            state.tags = [];
        };

        return {
            ...toRefs(tableState),
            ...toRefs(state),
            onSearch,
            deleteTag,
            deleteAllTags,

        };
    },
};
</script>
