<template>
    <div class="p-toolbox">
        <div class="toolbox-inner">
            <div v-if="$scopedSlots['left-area']"
                 class="left-area-wrapper"
            >
                <slot name="left-area" />
            </div>
            <div v-if="searchable"
                 class="search-wrapper"
            >
                <p-search v-if="searchType === SEARCH_TYPES.plain"
                          v-model="proxyState.searchText"
                          :placeholder="placeholder"
                          @search="onSearch"
                          @delete="onSearch()"
                />
                <p-query-search v-else-if="searchType === SEARCH_TYPES.query"
                                :placeholder="placeholder"
                                :key-item-sets="keyItemSets"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
            <div v-if="isToolsWrapperVisible"
                 class="tools-wrapper"
            >
                <div v-if="paginationVisible"
                     class="tool"
                >
                    <div v-if="$scopedSlots['pagination-area']">
                        <slot name="pagination-area" />
                    </div>
                    <p-text-pagination v-else
                                       :this-page="proxyState.thisPage"
                                       :all-page="allPage"
                                       :has-next-page="hasNextPage"
                                       @pageChange="onChangeThisPage"
                    />
                </div>
                <div v-if="pageSizeChangeable"
                     class="tool"
                >
                    <p-select-dropdown class="dropdown-list"
                                       :selected="pageSize"
                                       :menu="pageMenu"
                                       @select="onChangePageSize"
                    >
                        <template #dropdown-button>
                            {{ proxyState.pageSize }}
                        </template>
                    </p-select-dropdown>
                </div>
                <div v-if="sortable"
                     class="tool"
                >
                    <p-select-dropdown class="dropdown-list"
                                       :selected="selectedSortBy"
                                       :menu="sortByOptions"
                                       @select="onChangeSortBy"
                    >
                        <template #dropdown-button>
                            {{ selectedSortBy }}
                        </template>
                    </p-select-dropdown>
                </div>
                <div class="right-tool-group">
                    <div v-if="exportable"
                         class="tool"
                    >
                        <p-icon-button name="ic_excel"
                                       @click="$emit('export', $event)"
                        />
                    </div>
                    <div v-if="settingsVisible"
                         class="tool"
                    >
                        <p-icon-button name="ic_settings-filled"
                                       @click="$emit('click-settings', $event)"
                        />
                    </div>
                    <div v-if="refreshable"
                         class="tool"
                    >
                        <p-icon-button name="ic_refresh"
                                       @click="$emit('refresh', $event)"
                        />
                    </div>
                </div>
            </div>
            <div class="filters-wrapper">
                <p-query-search-tags v-show="searchable && filtersVisible && searchType === SEARCH_TYPES.query"
                                     :tags="proxyState.queryTags"
                                     :timezone="timezone"
                                     :converter="queryTagConverter"
                                     @change="onQueryTagsChange"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, nextTick, reactive, toRefs,
} from 'vue';

import { groupBy } from 'lodash';

import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';
import PSelectDropdown from '@/controls/dropdown/select-dropdown/PSelectDropdown.vue';
import type { SelectDropdownMenuItem } from '@/controls/dropdown/select-dropdown/type';
import { defaultConverter } from '@/controls/search/query-search-tags/helper';
import PQuerySearchTags from '@/controls/search/query-search-tags/PQuerySearchTags.vue';
import type { QueryTag } from '@/controls/search/query-search-tags/type';
import PQuerySearch from '@/controls/search/query-search/PQuerySearch.vue';
import type {
    KeyItemSet, QueryItem, ValueHandlerMap, ValueSet,
} from '@/controls/search/query-search/type';
import PSearch from '@/controls/search/search/PSearch.vue';
import type { SearchType } from '@/controls/toolbox/config';
import { SEARCH_TYPES } from '@/controls/toolbox/config';
import type { ToolboxOptions, ToolboxProps } from '@/controls/toolbox/type';
import { useProxyValue } from '@/hooks/use-proxy-state/use-proxy-state';
import PTextPagination from '@/navigation/pagination/text-pagination/PTextPagination.vue';


export default defineComponent({
    name: 'PToolbox',
    components: {
        PSelectDropdown,
        PQuerySearchTags,
        PSearch,
        PQuerySearch,
        PTextPagination,
        PIconButton,
    },
    props: {
        paginationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeChangeable: {
            type: Boolean,
            default: true,
        },
        placeholder: {
            type: String,
            default: undefined,
        },
        settingsVisible: {
            type: Boolean,
            default: false,
        },
        sortable: {
            type: Boolean,
            default: false,
        },
        exportable: {
            type: Boolean,
            default: false,
        },
        refreshable: {
            type: Boolean,
            default: true,
        },
        searchable: {
            type: Boolean,
            default: true,
        },
        filtersVisible: {
            type: Boolean,
            default: true,
        },
        searchType: {
            type: String as PropType<SearchType>,
            default: SEARCH_TYPES.plain,
        },
        thisPage: {
            type: Number,
            validator(value?: number) {
                return value === undefined || value > 0;
            },
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 24,
        },
        totalCount: {
            type: Number,
            default: undefined,
        },
        hasNextPage: {
            type: Boolean,
            default: false,
        },
        sortBy: {
            type: String,
            default: '',
        },
        pageSizeOptions: {
            type: Array as PropType<number[]>,
            default: () => [24, 36, 48],
        },
        sortByOptions: {
            type: Array as PropType<SelectDropdownMenuItem[]>,
            default: () => [],
        },
        keyItemSets: {
            type: Array as PropType<KeyItemSet[]>,
            default: () => [],
        },
        valueHandlerMap: {
            type: Object as PropType<ValueHandlerMap>,
            default: () => ({}),
        },
        queryTags: {
            type: Array as PropType<QueryTag[]>,
            default: () => [],
        },
        searchText: {
            type: String,
            default: '',
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
    },
    setup(props: ToolboxProps, { emit }) {
        const proxyState = reactive({
            thisPage: useProxyValue<number>('thisPage', props, emit),
            pageSize: useProxyValue<number>('pageSize', props, emit),
            sortBy: useProxyValue('sortBy', props, emit),
            searchText: useProxyValue<string>('searchText', props, emit),
            queryTags: useProxyValue('queryTags', props, emit),
        });
        const sortByOptionsData = (props.sortable ? groupBy(props.sortByOptions, 'name') : undefined);
        const state = reactive({
            pageStart: computed(() => ((proxyState.thisPage - 1) * proxyState.pageSize) + 1),
            allPage: computed<number|undefined>(() => {
                if (props.totalCount !== undefined) {
                    return Math.ceil((props.totalCount || 0) / proxyState.pageSize) || 1;
                }
                return undefined;
            }),
            pageMenu: computed<SelectDropdownMenuItem[]>(() => {
                if (!Array.isArray(props.pageSizeOptions)) return [];
                return props.pageSizeOptions.map((d) => ({
                    name: `${d}`, label: `${d}`, type: 'item',
                }));
            }),
            selectedSortBy: computed(() => ((sortByOptionsData && props.sortable) ? sortByOptionsData[proxyState.sortBy]?.[0]?.label : proxyState.sortBy)),
            valueSetMap: computed<Record<string, ValueSet>>(() => {
                const valueSetMap: Record<string, ValueSet> = {};
                (props.keyItemSets ?? []).forEach((keyItemSet) => keyItemSet.items.forEach((item) => {
                    if (item.valueSet) valueSetMap[item.name] = item.valueSet;
                }));
                return valueSetMap;
            }),
            queryTagConverter: computed(() => {
                const valueSetMap = state.valueSetMap;
                return (queryTag: QueryItem) => {
                    const { key, value } = queryTag;
                    if (key && value && valueSetMap[key.name]) {
                        const valueLabel = valueSetMap[key.name]?.[value.name]?.label;
                        return {
                            ...queryTag,
                            value: { ...value, label: valueLabel ?? value.label ?? value.name },
                        };
                    }
                    return defaultConverter(queryTag, props.timezone);
                };
            }),
            isToolsWrapperVisible: computed(() => props.paginationVisible || props.pageSizeChangeable || props.sortable || props.exportable || props.refreshable || props.settingsVisible),
        });


        const emitChange = (options: ToolboxOptions) => {
            emit('change', options);
        };

        const onChangeThisPage = (thisPage: number) => {
            proxyState.thisPage = thisPage;
            nextTick(() => {
                emitChange({ pageStart: state.pageStart });
            });
        };

        const onChangePageSize = (pageSize) => {
            proxyState.pageSize = pageSize;
            emitChange({ pageLimit: pageSize });
        };

        const onChangeSortBy = (sortBy) => {
            if (props.sortable) {
                proxyState.sortBy = sortBy;
                emitChange({ sortBy });
            }
        };

        const onSearch = (val?: string|QueryItem) => {
            if (!val) {
                proxyState.searchText = '';
                proxyState.thisPage = 1;
                nextTick(() => {
                    emitChange({ searchText: '', pageStart: state.pageStart });
                });
            } else if (typeof val === 'string') {
                proxyState.searchText = val;
                proxyState.thisPage = 1;
                nextTick(() => {
                    emitChange({ searchText: val, pageStart: state.pageStart });
                });
            } else {
                proxyState.queryTags = [...proxyState.queryTags, val];
            }
        };

        const onQueryTagsChange = (tags: QueryTag[]) => {
            if (proxyState.queryTags !== tags) {
                proxyState.queryTags = tags;
                proxyState.thisPage = 1;
                nextTick(() => {
                    emitChange({ queryTags: tags, pageStart: state.pageStart });
                });
            }
        };

        return {
            SEARCH_TYPES,
            proxyState,
            ...toRefs(state),
            onChangeThisPage,
            onChangePageSize,
            onChangeSortBy,
            onSearch,
            onQueryTagsChange,
        };
    },
});
</script>

<style lang="postcss">
.p-toolbox {
    @apply w-full;
    .toolbox-inner {
        @apply flex flex-wrap w-full;
    }

    .left-area-wrapper {
        @apply flex-shrink-0 mr-4 mb-4;
        order: 1;
    }
    .search-wrapper {
        @apply w-full mb-4;
        order: 3;
    }
    .tools-wrapper {
        @apply flex-shrink-0 inline-flex justify-end;
        max-width: 100%;
        flex-grow: 1;
        order: 2;
        flex-wrap: wrap;
        .right-tool-group {
            display: flex;
        }
        .dropdown-list {
            min-width: 6.5rem;
            .p-dropdown-btn {
                min-width: 6rem;
            }
        }
        .tool {
            @apply ml-2 mb-4;
            display: inline-block;
            flex-shrink: 0;
        }
    }
    .filters-wrapper {
        @apply w-full;
        order: 4;
    }

    @screen lg {
        .search-wrapper {
            order: 2;
            flex-grow: 100;
            width: auto;
        }
        .tools-wrapper {
            order: 3;
        }
    }
}

</style>
