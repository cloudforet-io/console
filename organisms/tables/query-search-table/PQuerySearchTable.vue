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
                     :excel-visible="excelVisible"
                     :row-cursor-pointer="rowCursorPointer"
                     use-cursor-loading
                     sortable
                     :selectable="selectable"
                     :multi-select="multiSelect"
                     @changePageSize="onChangePageSize"
                     @changePageNumber="onChangePageNumber"
                     @changeSort="onChangeSort"
                     @select="onSelect"
                     @clickRefresh="onRefresh"
                     @clickExcel="emitExport()"
                     @rowLeftClick="byPassEvent('rowLeftClick', ...arguments)"
                     @rowRightClick="byPassEvent('rowRightClick', ...arguments)"
                     @rowMiddleClick="byPassEvent('rowMiddleClick', ...arguments)"
                     @rowMouseOver="byPassEvent('rowMouseOver', ...arguments)"
                     @rowMouseOut="byPassEvent('rowMouseOut', ...arguments)"
    >
        <template v-if="!$scopedSlots['toolbox-left']" #toolbox-left>
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
        </template>
        <template v-if="!$scopedSlots['toolbox-bottom']" #toolbox-bottom>
            <div class="flex flex-col flex-1 block lg:hidden">
                <p-query-search class="block lg:hidden mt-4"
                                :class="{ 'mb-4': !!$scopedSlots['toolbox-bottom'] && tags.length === 0}"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
                <div class="mt-4" :class="{ 'mb-4': $scopedSlots['toolbox-bottom']}">
                    <p-hr v-if="tags.length > 0" style="width: 100%;" />
                    <p-query-search-tags ref="tagsRef"
                                         style="margin-top: 0.5rem;"
                                         :tags="tags"
                                         :timezone="timezone"
                                         @init="onQueryTagsInit"
                                         @change="onQueryTagsChange"
                    />
                </div>
            </div>
        </template>
        <template v-for="(_, slot, i) of $scopedSlots" v-slot:[slot]="scope">
            <template v-if="slot === 'toolbox-left'" >
                <slot name="toolbox-left" />
                <div :key="i" class="left-toolbox-item hidden lg:block">
                    <p-query-search :key-items="keyItems"
                                    :value-handler-map="valueHandlerMap"
                                    @search="onSearch"
                    />
                </div>
            </template>
            <div v-else-if="slot === 'toolbox-bottom'" :key="i" class="flex flex-col flex-1">
                <p-query-search class="block lg:hidden mt-4"
                                :class="{ 'mb-4': !!$scopedSlots['toolbox-bottom'] && tags.length === 0}"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
                <div class="mt-4" :class="{ 'mb-4': $scopedSlots['toolbox-bottom']}">
                    <p-hr v-if="tags.length > 0" style="width: 100%;" />
                    <p-query-search-tags ref="tagsRef"
                                         style="margin-top: 0.5rem;"
                                         :tags="tags"
                                         :timezone="timezone"
                                         @init="onQueryTagsInit"
                                         @change="onQueryTagsChange"
                    />
                </div>
                <slot name="toolbox-bottom" />
            </div>
            <slot v-else :name="slot" v-bind="scope" />
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { forEach } from 'lodash';
import { QueryItem } from '@/components/organisms/search/query-search/type';
import {
    QuerySearchTagsFunctions,
    QuerySearchTagsListeners,
    QueryTag,
} from '@/components/organisms/search/query-search-tags/type';
import { Options, QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';

const CHILDREN_INIT_COUNT = 1;

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
        selectable: {
            type: Boolean,
            default: true,
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
        excelVisible: {
            type: Boolean,
            default: true,
        },
        rowCursorPointer: {
            type: Boolean,
            default: false,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        colCopy: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: QuerySearchTableProps, { slots, emit, listeners }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

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
            tagsRef: null as null|QuerySearchTagsFunctions,
        });

        // check if each option value is 'undefined' to escape auto type casting
        const getFullOptions = (options: Partial<Options>): Options => ({
            sortBy: options.sortBy === undefined ? state.proxySortBy : options.sortBy,
            sortDesc: options.sortDesc === undefined ? state.proxySortDesc : options.sortDesc,
            thisPage: options.thisPage === undefined ? state.proxyThisPage : options.thisPage,
            pageSize: options.pageSize === undefined ? state.proxyPageSize : options.pageSize,
            queryTags: options.queryTags === undefined ? state.tags : options.queryTags,
        });


        /** Event emitter */
        const emitSelect = () => {
            emit('select', [...state.proxySelectIndex]);
        };

        let initChildren = 0;
        const emitInit = (options: Partial<Options>) => {
            initChildren += 1;
            if (initChildren < CHILDREN_INIT_COUNT) return;
            emit('init', getFullOptions(options));
        };

        const emitChange = (options: Partial<Options> = {}) => {
            state.proxySelectIndex = [];
            emitSelect();

            if (options.queryTags || state.proxyThisPage > state.proxyPageSize) {
                options.thisPage = 1;
                state.proxyThisPage = 1;
            }

            emit('change', getFullOptions(options), options);
        };

        const byPassEvent = (name, item, index, mouseEvent) => {
            emit(name, item, index, mouseEvent);
        };

        const emitExport = () => {
            emit('export');
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
            state.proxySelectIndex = [...selectIndex];
            emitSelect();
        };

        const onRefresh = () => {
            emitChange();
        };

        /** Search event listeners */
        const addTag = computed(() => (state.tagsRef ? state.tagsRef.addTag : () => {
            throw new Error('[QuerySearchTable] addTag must be invoked after component is mounted.');
        }));
        const deleteTag = computed(() => (state.tagsRef ? state.tagsRef.deleteTag : () => {
            throw new Error('[QuerySearchTable] deleteTag must be invoked after component is mounted.');
        }));
        const deleteAllTags = computed(() => (state.tagsRef ? state.tagsRef.deleteAllTags : () => {
            throw new Error('[QuerySearchTable] deleteAllTags must be invoked after component is mounted.');
        }));

        const onSearch = async (query: QueryItem) => {
            if (!state.tagsRef) return;
            state.tagsRef.addTag(query);
        };

        const onQueryTagsInit: QuerySearchTagsListeners['init'] = ({ tags }) => {
            emitInit({ queryTags: tags });
        };

        const onQueryTagsChange: QuerySearchTagsListeners['change'] = (tags: QueryTag[]) => {
            state.tags = tags;
            emitChange({ queryTags: tags });
        };

        return {
            ...toRefs(state),
            emitChange,
            emitExport,
            onChangePageSize,
            onChangePageNumber,
            onChangeSort,
            onSelect,
            onSearch,
            onQueryTagsInit,
            onQueryTagsChange,
            onRefresh,
            byPassEvent,
            addTag,
            deleteTag,
            deleteAllTags,
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
