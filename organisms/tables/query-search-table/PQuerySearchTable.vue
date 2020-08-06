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
                     selectable
                     @changePageSize="onChangePageSize"
                     @changePageNumber="onChangePageNumber"
                     @changeSort="onChangeSort"
                     @select="onSelect"
                     @clickRefresh="emitChange()"
                     @clickExcel="emitExport()"
    >
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex flex-col flex-1">
                <p-query-search class="block lg:hidden mt-4"
                                :class="{ 'mb-4': !!$scopedSlots['toolbox-bottom'] && tags.length === 0}"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
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
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { forEach } from 'lodash';
import { QueryItem } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { Options, QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import { ComponentInstance } from '@vue/composition-api/dist/component';

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
        keyItems: {
            type: Array,
            default: () => [],
        },
        valueHandlerMap: {
            type: Object,
            default: () => ({}),
        },
        queryTags: {
            type: Array,
            default: () => [],
        },
    },
    setup(props: QuerySearchTableProps, { slots, emit, listeners }) {
        const vm = getCurrentInstance() as ComponentInstance;

        const state = reactive({
            /** table */
            allPage: computed(() => Math.ceil(props.totalCount / props.pageSize) || 1),
            proxySortBy: makeOptionalProxy('sortBy', vm),
            proxySortDesc: makeOptionalProxy('sortDesc', vm),
            proxySelectIndex: makeOptionalProxy('selectIndex', vm),
            proxyThisPage: makeOptionalProxy('thisPage', vm),
            proxyPageSize: makeOptionalProxy('pageSize', vm),
            /** search */
            tags: makeOptionalProxy('queryTags', vm),
            /** others */
            options: computed<Options>(() => ({
                sortBy: state.proxySortBy,
                sortDesc: state.proxySortDesc,
                thisPage: state.proxyThisPage,
                pageSize: state.proxyPageSize,
                queryTags: state.tags,
            })),
            slotNames: computed(() => {
                const res: string[] = [];
                forEach(slots, (func, name) => {
                    if (!['toolbox-left', 'toolbox-bottom'].includes(name)) res.push(name);
                });
                return res;
            }),
        });

        /** Event emitter */
        const emitChange = (options?: Partial<Options>) => {
            emit('change', Object.freeze({
                ...state.options,
                ...options,
            }), Object.freeze({ ...options }));
        };

        const emitExport = () => {
            emit('export');
        };

        const emitSelect = () => {
            emit('select', [...state.proxySelectIndex]);
        };

        /** Table event listeners */
        const onChangePageSize = (pageSize: number) => {
            emitChange({ pageSize });
        };

        const onChangePageNumber = (thisPage: number) => {
            emitChange({ thisPage });
        };

        const onChangeSort = (sortBy: string, sortDesc: boolean) => {
            emitChange({ sortBy, sortDesc });
        };

        const onSelect = (selectIndex: number[]) => {
            state.selectIndex = [...selectIndex];
            emitSelect();
        };

        /** Search event listeners */
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

        const deleteTag = (idx: number) => {
            state.tags.splice(idx, 1);
            emitChange({ queryTags: state.tags });
        };

        const deleteAllTags = () => {
            state.tags = [];
            emitChange({ queryTags: state.tags });
        };

        const onSearch = async (query: QueryItem) => {
            if (!validation(query)) return;
            // TODO: convert queryItem to queryTag with datatype
            // @ts-ignore
            state.tags = [...state.tags, query];
            emitChange({ queryTags: state.tags });
        };

        return {
            ...toRefs(state),
            deleteTag,
            deleteAllTags,
            emitChange,
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
    .p-query-search-table {
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
