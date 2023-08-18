<template>
    <div class="p-toolbox">
        <div class="toolbox-inner">
            <div v-if="slots['left-area']"
                 class="left-area-wrapper"
            >
                <slot name="left-area" />
            </div>
            <div v-if="searchable"
                 class="search-wrapper"
            >
                <p-search v-if="searchType === SEARCH_TYPES.plain"
                          v-model:value="proxyState.searchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
                <p-query-search v-else-if="searchType === SEARCH_TYPES.query"
                                :key-item-sets="keyItemSets"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
            <div class="tools-wrapper">
                <div v-if="paginationVisible"
                     class="tool"
                >
                    <p-text-pagination :this-page="proxyState.thisPage"
                                       :all-page="state.allPage"
                                       @page-change="onChangeThisPage"
                    />
                </div>
                <div v-if="pageSizeChangeable"
                     class="tool"
                >
                    <p-select-dropdown class="dropdown-list"
                                       :items="state.pageMenu"
                                       @select="onChangePageSize"
                    >
                        {{ proxyState.pageSize }}
                    </p-select-dropdown>
                </div>
                <div v-if="sortable"
                     class="tool"
                >
                    <p-select-dropdown class="dropdown-list"
                                       :items="sortByOptions"
                                       :sort-by="sortBy"
                                       @select="onChangeSortBy"
                    >
                        {{ state.selectedSortBy }}
                    </p-select-dropdown>
                </div>
                <div class="right-tool-group">
                    <div v-if="exportable"
                         class="tool"
                    >
                        <p-icon-button name="ic_excel"
                                       @click="handleExport"
                        />
                    </div>
                    <div v-if="settingsVisible"
                         class="tool"
                    >
                        <p-icon-button name="ic_settings-filled"
                                       @click="handleClickSettings"
                        />
                    </div>
                    <div v-if="refreshable"
                         class="tool"
                    >
                        <p-icon-button name="ic_refresh"
                                       @click="handleRefresh"
                        />
                    </div>
                </div>
            </div>
            <div class="filters-wrapper">
                <p-query-search-tags v-show="searchable && filtersVisible && searchType === SEARCH_TYPES.query"
                                     :tags="proxyState.queryTags"
                                     :timezone="timezone"
                                     :converter="state.queryTagConverter"
                                     @change="onQueryTagsChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { groupBy } from 'lodash';
import {
    computed, nextTick, reactive, useSlots,
} from 'vue';

import { useProxyValue } from '@/hooks/proxy-state';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';
import PQuerySearch from '@/inputs/search/query-search/PQuerySearch.vue';
import type {
    QueryItem, ValueSet,
} from '@/inputs/search/query-search/type';
import { defaultConverter } from '@/inputs/search/query-search-tags/helper';
import PQuerySearchTags from '@/inputs/search/query-search-tags/PQuerySearchTags.vue';
import type { QueryTag } from '@/inputs/search/query-search-tags/type';
import PSearch from '@/inputs/search/search/PSearch.vue';
import PTextPagination from '@/navigation/pagination/text-pagination/PTextPagination.vue';
import { SEARCH_TYPES } from '@/navigation/toolbox/config';
import type { ToolboxOptions, ToolboxProps } from '@/navigation/toolbox/type';

const props = withDefaults(defineProps<ToolboxProps>(), {
    paginationVisible: true,
    pageSizeChangeable: true,
    settingsVisible: false,
    sortable: false,
    exportable: false,
    refreshable: true,
    searchable: true,
    filtersVisible: true,
    searchType: SEARCH_TYPES.plain,
    thisPage: 1,
    pageSize: 24,
    totalCount: 0,
    sortBy: '',
    pageSizeOptions: () => [24, 36, 48],
    sortByOptions: () => [],
    keyItemSets: () => [],
    valueHandlerMap: () => ({}),
    queryTags: () => [],
    searchText: '',
    timezone: 'UTC',
});
const emit = defineEmits(['update:thisPage', 'update:pageSize', 'update:sortBy', 'update:searchText', 'update:queryTags', 'export', 'refresh', 'click-settings', 'change']);
const slots = useSlots();

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
    allPage: computed(() => Math.ceil((props.totalCount || 0) / proxyState.pageSize) || 1),
    pageMenu: computed<MenuItem[]>(() => {
        if (!Array.isArray(props.pageSizeOptions)) return [];
        return props.pageSizeOptions.map((d) => ({
            name: d.toString(), label: d.toString(), type: 'item',
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
});

const handleExport = (event) => {
    emit('export', event);
};

const handleRefresh = (event) => {
    emit('refresh', event);
};

const handleClickSettings = (event) => {
    emit('click-settings', event);
};

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
