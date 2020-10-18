<template>
    <p-toolbox-table class="p-query-search-table"
                     :fields="fields"
                     :items="items"
                     :loading="loading"
                     :all-page="allPage"
                     :sort-by.sync="proxyState.sortBy"
                     :sort-desc.sync="proxyState.sortDesc"
                     :select-index.sync="proxyState.selectIndex"
                     :this-page.sync="proxyState.thisPage"
                     :page-size.sync="proxyState.pageSize"
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
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <template v-if="searchable">
                <slot v-if="!['toolbox-bottom', 'toolbox-left'].includes(slot) && !slot.startsWith('tag-')"
                      :name="slot" v-bind="scope"
                />
            </template>
            <slot v-else :name="slot" v-bind="scope" />
        </template>
        <template v-if="searchable" #toolbox-left="scope">
            <slot name="toolbox-left" v-bind="scope" />
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
        </template>
        <template v-if="searchable" #toolbox-bottom="scope">
            <div class="flex flex-col flex-1">
                <p-query-search class="block lg:hidden mt-4"
                                :class="{ 'mb-4': !!$scopedSlots['toolbox-bottom'] && proxyState.queryTags.length === 0}"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
                <div class="mt-4" :class="{ 'mb-4': $scopedSlots['toolbox-bottom']}">
                    <p-query-search-tags ref="tagsRef"
                                         :tags="proxyState.queryTags"
                                         :timezone="timezone"
                                         @init="onQueryTagsInit"
                                         @change="onQueryTagsChange"
                    >
                        <template v-for="(_, slot) of tagSlots" v-slot:[slot]="scope">
                            <slot :name="`tag-${slot}`" v-bind="scope" />
                        </template>
                    </p-query-search-tags>
                </div>
                <slot name="toolbox-bottom" v-bind="scope" />
            </div>
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
        PQuerySearchTags, PQuerySearch, PToolboxTable,
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
            default: undefined,
        },
        sortDesc: {
            type: Boolean,
            default: undefined,
        },
        selectIndex: {
            type: Array,
            default: undefined,
        },
        thisPage: {
            type: Number,
            default: undefined,
        },
        pageSize: {
            type: Number,
            default: undefined,
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
            default: undefined,
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
        searchable: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: QuerySearchTableProps, { slots, emit, listeners }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const localState = reactive({
            selectIndex: props.selectIndex === undefined ? [] : props.selectIndex,
            sortBy: props.sortBy === undefined ? '' : props.sortBy,
            sortDesc: props.sortDesc === undefined ? true : props.sortDesc,
            thisPage: props.thisPage === undefined ? 1 : props.thisPage,
            pageSize: props.pageSize === undefined ? 15 : props.pageSize,
            queryTags: props.queryTags === undefined ? [] : props.queryTags,
        });


        const proxyState = reactive({
            selectIndex: makeOptionalProxy<number[]>('selectIndex', vm, localState, ['select']),
            sortBy: makeOptionalProxy<string>('sortBy', vm, localState),
            sortDesc: makeOptionalProxy<boolean>('sortDesc', vm, localState),
            thisPage: makeOptionalProxy<number>('thisPage', vm, localState),
            pageSize: makeOptionalProxy<number>('pageSize', vm, localState),
            queryTags: makeOptionalProxy<QueryTag[]>('queryTags', vm, localState),
        });

        const state = reactive({
            /** table */
            allPage: computed(() => Math.ceil(props.totalCount / proxyState.pageSize) || 1),
            /** search */
            tagsRef: null as null|QuerySearchTagsFunctions,
            tagSlots: computed(() => {
                const res = {};
                forEach(slots, (d, name) => {
                    if (name.startsWith('tag-')) res[name.substring(4)] = d;
                });
                return res;
            }),
        });


        // check if each option value is 'undefined' to escape auto type casting
        const getFullOptions = (options: Partial<Options>): Options => ({
            sortBy: options.sortBy === undefined ? proxyState.sortBy : options.sortBy,
            sortDesc: options.sortDesc === undefined ? proxyState.sortDesc : options.sortDesc,
            thisPage: options.thisPage === undefined ? proxyState.thisPage : options.thisPage,
            pageSize: options.pageSize === undefined ? proxyState.pageSize : options.pageSize,
            queryTags: options.queryTags === undefined ? proxyState.queryTags : options.queryTags,
        });


        /** Event emitter */
        const emitSelect = (selectIndex) => {
            proxyState.selectIndex = selectIndex;
        };

        let initChildren = 0;
        const emitInit = (options: Partial<Options>) => {
            initChildren += 1;
            if (initChildren < CHILDREN_INIT_COUNT) return;
            emit('init', getFullOptions(options));
        };

        const emitChange = (options: Partial<Options> = {}) => {
            emitSelect([]);

            if (options.queryTags || proxyState.thisPage > proxyState.pageSize) {
                options.thisPage = 1;
                proxyState.thisPage = 1;
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
            emitSelect([...selectIndex]);
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
            proxyState.queryTags = tags;
            emitChange({ queryTags: tags });
        };

        if (!props.searchable) emitInit({});

        return {
            proxyState,
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
        &.p-toolbox-table {
            .toolbox {
                @apply pb-2;

                .toolbox-bottom {
                    @apply mt-0;
                }
            }
        }
    }
</style>
