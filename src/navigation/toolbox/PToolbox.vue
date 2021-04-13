<template>
    <div class="p-toolbox">
        <div class="toolbox-inner">
            <div v-if="$scopedSlots['left-area']" class="left-area-wrapper">
                <slot name="left-area" />
            </div>
            <div v-if="searchable" class="search-wrapper" :class="{simple: !$scopedSlots['left-area']}">
                <p-search v-if="searchType === SEARCH_TYPES.plain"
                          v-model="proxyState.searchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
                <p-query-search v-else-if="searchType === SEARCH_TYPES.query"
                                :key-item-sets="keyItemSets"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
            <div class="tools-wrapper" :class="{simple: !$scopedSlots['left-area']}">
                <div v-if="paginationVisible" class="tool">
                    <p-text-pagination :this-page="proxyState.thisPage"
                                       :all-page="allPage"
                                       @pageChange="onChangeThisPage"
                    />
                </div>
                <div v-if="pageSizeChangeable" class="tool">
                    <p-dropdown-menu-btn class="dropdown-list"
                                         :menu="pageMenu"
                                         @select="onChangePageSize"
                    >
                        {{ proxyState.pageSize }}
                    </p-dropdown-menu-btn>
                </div>
                <div v-if="sortable" class="tool">
                    <p-dropdown-menu-btn class="dropdown-list"
                                         :menu="sortByMenu"
                                         @select="onChangeSortBy"
                    >
                        {{ proxyState.sortBy }}
                    </p-dropdown-menu-btn>
                </div>
                <div v-if="exportable" class="tool">
                    <p-icon-button name="ic_excel"
                                   @click="$emit('export',$event)"
                    />
                </div>
                <div v-if="refreshable" class="tool">
                    <p-icon-button name="ic_refresh"
                                   @click="$emit('refresh', $event)"
                    />
                </div>
            </div>
            <div class="filters-wrapper">
                <p-query-search-tags v-show="searchable && filtersVisible && searchType === SEARCH_TYPES.query"
                                     ref="tagRef"
                                     :tags="proxyState.queryTags"
                                     :timezone="timezone"
                                     @init="onQueryTagsInit"
                                     @change="onQueryTagsChange"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PDropdownMenuBtn from '@/inputs/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTextPagination from '@/navigation/pagination/text-pagination/PTextPagination.vue';
import {
    ComponentRenderProxy, computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeOptionalProxy } from '@/util/composition-helpers';
import PQuerySearch from '@/inputs/search/query-search/PQuerySearch.vue';
import { QueryTag } from '@/inputs/search/query-search-tags/type';
import { KeyItemSet, QueryItem, ValueHandlerMap } from '@/inputs/search/query-search/type';
import PSearch from '@/inputs/search/search/PSearch.vue';
import PQuerySearchTags from '@/inputs/search/query-search-tags/PQuerySearchTags.vue';
import { SEARCH_TYPES } from '@/navigation/toolbox/config';
import { ToolboxOptions } from '@/navigation/toolbox/type';

interface Props {
    paginationVisible: boolean;
    pageSizeChangeable: boolean;
    sortable: boolean;
    exportable: boolean;
    refreshable: boolean;
    searchable: boolean;
    filtersVisible: boolean;
    searchType: string;
    proxyState?: number;
    pageSize?: number;
    totalCount: number;
    pageSizeOptions: number[];
    sortByOptions: string[];
    keyItemSets: KeyItemSet[];
    valueHandlerMap: ValueHandlerMap;
    queryTags?: QueryTag[];
    searchText?: string;
    timezone: string;
}

export default defineComponent<Props>({
    name: 'PToolbox',
    components: {
        PQuerySearchTags,
        PSearch,
        PQuerySearch,
        PTextPagination,
        PDropdownMenuBtn,
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
            type: String,
            default: 'plain',
            validator(searchType) {
                return Object.values(SEARCH_TYPES).includes(searchType as any);
            },
        },
        thisPage: {
            type: Number,
            validator(value?: number) {
                return value === undefined || value > 0;
            },
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
        sortBy: {
            type: String,
            default: '',
        },
        pageSizeOptions: {
            type: Array,
            default: () => [24, 36, 48],
        },
        sortByOptions: {
            type: Array,
            default: () => [],
        },
        keyItemSets: {
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
        searchText: {
            type: String,
            default: undefined,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
    },
    setup(props: Props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const initPageSize = props.pageSizeOptions ? props.pageSizeOptions[0] || 24 : 24;
        const proxyState = reactive({
            thisPage: makeOptionalProxy<number>('thisPage', vm, 1),
            pageSize: makeOptionalProxy<number>('pageSize', vm, initPageSize),
            sortBy: makeOptionalProxy<string>('sortBy', vm, props.sortByOptions[0] || ''),
            searchText: makeOptionalProxy<string>('searchText', vm, ''),
            queryTags: makeOptionalProxy<QueryTag[]>('queryTags', vm, []),
        });

        const state = reactive({
            pageStart: computed(() => ((proxyState.thisPage - 1) * proxyState.pageSize) + 1),
            allPage: computed(() => Math.ceil(props.totalCount / proxyState.pageSize) || 1),
            pageMenu: computed(() => {
                if (!Array.isArray(props.pageSizeOptions)) return [];
                return props.pageSizeOptions.map(d => ({
                    name: d, label: d, type: 'item',
                }));
            }),
            sortByMenu: computed(() => {
                if (!Array.isArray(props.sortByOptions)) return [];
                return props.sortByOptions.map(d => ({
                    name: d, label: d, type: 'item',
                }));
            }),
            tagRef: null as any,
        });


        const emitChange = (options: ToolboxOptions) => {
            vm.$emit('change', options);
        };

        const onChangeThisPage = (thisPage: number) => {
            proxyState.thisPage = thisPage;
            vm.$nextTick(() => {
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
                emitChange({ searchText: '' });
            } else if (typeof val === 'string') {
                proxyState.searchText = val;
                emitChange({ searchText: val });
            } else if (state.tagRef) {
                state.tagRef.addTag(val);
            } else {
                proxyState.queryTags.push(val);
            }
        };

        const onQueryTagsInit = ({ tags }) => {
            vm.$emit('init-tags', {
                pageStart: state.pageStart,
                pageLimit: proxyState.pageSize,
                searchText: proxyState.searchText,
                sortBy: proxyState.sortBy,
                queryTags: tags,
            } as ToolboxOptions);
        };

        const onQueryTagsChange = (tags: QueryTag[]) => {
            if (proxyState.queryTags !== tags) {
                proxyState.queryTags = tags;
                emitChange({ queryTags: tags });
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
            onQueryTagsInit,
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
        @apply flex-shrink-0 inline-flex justify-end mb-4;
        flex-grow: 1;
        order: 2;
        .dropdown-list {
            .p-dropdown-btn {
                min-width: 6rem;
            }
        }
        .tool {
            @apply ml-4;
        }
    }
    .filters-wrapper {
        @apply w-full;
        order: 4;
    }

    @screen md {
        .search-wrapper {
            &.simple {
                order: 2;
                width: auto;
                flex-grow: 100;
            }
        }
        .tools-wrapper {
            &.simple {
                order: 3;
            }
        }
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
