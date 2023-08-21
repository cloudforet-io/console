<template>
    <p-pane-layout class="p-toolbox-table">
        <div class="top-wrapper">
            <slot name="toolbox-top" />
            <p-toolbox v-model:this-page="proxyState.thisPage"
                       v-model:page-size="proxyState.pageSize"
                       v-model:query-tags="proxyState.queryTags"
                       v-model:search-text="proxyState.searchText"
                       :pagination-visible="paginationVisible"
                       :page-size-changeable="pageSizeChangeable"
                       :settings-visible="settingsVisible"
                       :exportable="exportable"
                       :refreshable="refreshable"
                       :searchable="searchable"
                       :sortable="false"
                       :filters-visible="filtersVisible"
                       :search-type="searchType"
                       :total-count="totalCount"
                       :page-size-options="pageSizeOptions"
                       :key-item-sets="keyItemSets"
                       :value-handler-map="valueHandlerMap"
                       :timezone="timezone"
                       @change="handleChange"
                       @export="handleExport"
                       @refresh="handleRefresh"
                       @click-settings="handleClickSettings"
            >
                <template v-if="slots['toolbox-left']"
                          #left-area
                >
                    <div class="toolbox-left">
                        <slot name="toolbox-left" />
                    </div>
                </template>
            </p-toolbox>
            <slot name="toolbox-bottom" />
        </div>

        <p-data-table v-model:select-index="proxyState.selectIndex"
                      v-model:sort-by="proxyState.sortBy"
                      v-model:sort-desc="proxyState.sortDesc"
                      :fields="fields"
                      :items="items"
                      :sortable="sortable"
                      :selectable="selectable"
                      :multi-select="multiSelect"
                      :col-copy="colCopy"
                      :table-style-type="tableStyleType"
                      :striped="striped"
                      :bordered="bordered"
                      :disable-hover="disableHover"
                      :loading="loading"
                      :use-cursor-loading="useCursorLoading"
                      :row-height-fixed="rowHeightFixed"
                      :row-cursor-pointer="rowCursorPointer"
                      :invalid="invalid"
                      :get-row-class-names="getRowClassNames"
                      :get-row-selectable="getRowSelectable"
                      v-on="listeners"
                      @change-sort="changeSort"
        >
            <template v-for="(_, slot) of slots"
                      #[slot]="scope"
            >
                <slot v-if="!slot.toString().startsWith('toolbox')"
                      :name="slot"
                      v-bind="scope"
                />
            </template>
        </p-data-table>
        <slot name="toolbox-table-bottom" />
    </p-pane-layout>
</template>

<script setup lang="ts">
import {
    reactive, useAttrs, useSlots, watch,
} from 'vue';

import { DATA_TABLE_STYLE_TYPE } from '@/data-display/tables/data-table/config';
import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import type { ToolboxTableOptions, ToolboxTableProps } from '@/data-display/tables/toolbox-table/type';
import { useProxyValue } from '@/hooks';
import type { QueryTag } from '@/inputs/search/query-search-tags/type';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';
import { SEARCH_TYPES } from '@/navigation/toolbox/config';
import PToolbox from '@/navigation/toolbox/PToolbox.vue';

const props = withDefaults(defineProps<ToolboxTableProps>(), {
    /* data table props */
    loading: false,
    fields: () => [],
    items: () => [],
    sortable: false,
    sortBy: '',
    sortDesc: true,
    colCopy: false,
    selectable: false,
    selectIndex: () => [],
    multiSelect: true,
    useCursorLoading: false,
    tableStyleType: DATA_TABLE_STYLE_TYPE.default,
    striped: false,
    bordered: undefined,
    disableHover: false,
    rowHeightFixed: true,
    rowCursorPointer: false,
    invalid: false,

    /* toolbox props */
    paginationVisible: true,
    pageSizeChangeable: true,
    settingsVisible: false,
    exportable: false,
    refreshable: true,
    searchable: true,
    filtersVisible: true,
    searchType: SEARCH_TYPES.plain,
    thisPage: 1,
    pageSize: 15,
    totalCount: 0,
    pageSizeOptions: () => [15, 30, 45],
    sortByOptions: () => [],
    keyItemSets: () => [],
    valueHandlerMap: () => ({}),
    queryTags: () => [],
    searchText: '',
    timezone: 'UTC',
});
const emit = defineEmits([
    'update:selectIndex',
    'update:sortBy',
    'update:sortDesc',
    'update:thisPage',
    'update:pageSize',
    'update:queryTags',
    'update:searchText',
    'change',
    'export',
    'refresh',
    'click-settings',
]);
const attrs = useAttrs();
const slots = useSlots();

const proxyState = reactive({
    selectIndex: useProxyValue<number[]>('selectIndex', props, emit, ['select']),
    sortBy: useProxyValue<string>('sortBy', props, emit),
    sortDesc: useProxyValue<boolean>('sortDesc', props, emit),
    thisPage: useProxyValue<number>('thisPage', props, emit),
    pageSize: useProxyValue<number>('pageSize', props, emit),
    queryTags: useProxyValue<QueryTag[]>('queryTags', props, emit),
    searchText: useProxyValue<string>('searchText', props, emit),
});

const emitChange = (options: ToolboxTableOptions) => {
    emit('change', options);
};

const handleChange = (options: ToolboxTableOptions) => {
    emitChange(options);
};
const handleExport = () => {
    emit('export');
};
const handleRefresh = () => {
    emit('refresh');
};
const handleClickSettings = () => {
    emit('click-settings');
};

const changeSort = (sortBy, sortDesc) => {
    proxyState.thisPage = 1;
    emitChange({ sortBy, sortDesc, pageStart: 1 });
};

const checkSelectIndex = () => {
    if (!Array.isArray(props.items)) return;
    const selectIndex: number[] = [];
    proxyState.selectIndex.forEach((d) => {
        if (props.items[d] !== undefined) selectIndex.push(d);
    });
    if (proxyState.selectIndex.length !== selectIndex.length) {
        proxyState.selectIndex = selectIndex;
    }
};

const listeners = {
    ...attrs,
};

watch(() => props.items, () => {
    checkSelectIndex();
});
watch(() => proxyState.thisPage, () => {
    proxyState.selectIndex = [];
}, { immediate: false });

</script>

<style lang="postcss">
.p-toolbox-table {
    @apply flex flex-col bg-white border border-gray-200 rounded-xs;

    .top-wrapper {
        @apply flex flex-col rounded-xs;
    }
    .p-data-table {
        overflow: auto;
    }

    .p-toolbox {
        padding: 1.5rem 1rem 0.5rem;
    }
    .toolbox-left {
        display: flex;
    }
}
</style>
