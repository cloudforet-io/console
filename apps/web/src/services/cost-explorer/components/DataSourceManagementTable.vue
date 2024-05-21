<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToolboxTable, PLazyImg, PI } from '@spaceone/design-system';
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useQueryTags } from '@/common/composables/query-tags';

import { red } from '@/styles/colors';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    dataSourceList: computed<DataSourceItem[]>(() => dataSourcesPageGetters.dataSourceList),
    selectedIndices: computed<number|undefined>(() => dataSourcesPageState.selectedDataSourceIndices),
    dataSourceListPageStart: computed<number>(() => dataSourcesPageState.dataSourceListPageStart),
    dataSourceListPageLimit: computed<number>(() => dataSourcesPageState.dataSourceListPageLimit),
    dataSourceListSearchFilters: computed<ConsoleFilter[]>(() => dataSourcesPageState.dataSourceListSearchFilters),
});
const state = reactive({
    loading: false,
});
const tableState = reactive({
    fields: computed(() => [
        {
            name: 'name',
            label: 'Data Source',
            type: 'item',
        },
        {
            name: 'data_source_id',
            label: 'ID',
            type: 'item',
            sortable: false,
        },
        {
            name: 'data_source_account_count',
            label: 'Linked Account',
            type: 'item',
            sortable: false,
        },
        {
            name: 'connected_workspace_count',
            label: 'Workspace',
            type: 'item',
            sortable: false,
        },
        {
            name: 'created_at',
            label: 'Registered Time',
            type: 'item',
            sortable: false,
        },
    ]),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'data_source_id', label: 'ID' },
            { name: 'created_at', label: 'Registered Time', dataType: 'datetime' },
        ],
    }]),
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        name: makeDistinctValueHandler('cost_analysis.DataSource', 'name'),
        data_source_id: makeDistinctValueHandler('cost_analysis.DataSource', 'data_source_id'),
        created_at: makeDistinctValueHandler('cost_analysis.DataSource', 'created_at'),
    })),
});

const datasourceListApiQueryHelper = new ApiQueryHelper();
let datasourceListApiQuery = datasourceListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const handleUpdateSelectIndex = (indices: number[]) => {
    dataSourcesPageStore.selectedDataSourceIndices(indices);
};
const handleChange = (options: any = {}) => {
    datasourceListApiQuery = getApiQueryWithToolboxOptions(datasourceListApiQueryHelper, options) ?? datasourceListApiQuery;
    if (options.queryTags !== undefined) {
        dataSourcesPageStore.setDataSourceListSearchFilters(datasourceListApiQueryHelper.filters);
    }
    if (options.pageStart !== undefined) dataSourcesPageStore.setDataSourceListPageStart(options.pageStart);
    if (options.pageLimit !== undefined) dataSourcesPageStore.setDataSourceListPageLimit(options.pageLimit);
    fetchDataSourceList();
};

const fetchDataSourceList = async () => {
    datasourceListApiQueryHelper.setPage(storeState.dataSourceListPageStart, storeState.dataSourceListPageLimit)
        .setFilters(storeState.dataSourceListSearchFilters);
    await dataSourcesPageStore.fetchDataSourceList({
        query: datasourceListApiQueryHelper.data,
    });
};
</script>

<template>
    <section class="data-source-management-table">
        <p-toolbox-table class="table"
                         search-type="query"
                         searchable
                         selectable
                         sortable
                         sort-by="name"
                         :multi-select="false"
                         :sort-desc="true"
                         :select-index="storeState.selectedIndices"
                         :fields="tableState.fields"
                         :items="storeState.dataSourceList"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         :loading="state.loading"
                         :style="{height: `${props.tableHeight}px`}"
                         @change="handleChange"
                         @refresh="fetchDataSourceList"
                         @update:select-index="handleUpdateSelectIndex"
        >
            <template #col-name-format="{value, item}">
                <div class="col-name">
                    <p-lazy-img class="left-icon"
                                :src="item.icon"
                                width="1.5rem"
                                height="1.5rem"
                    />
                    <span>{{ value }}</span>
                </div>
            </template>
            <template #col-data_source_account_count-format="{value, item}">
                <div class="col-data-source-account-count">
                    <p>
                        <span v-if="item.linked_count !== undefined">{{ item.linked_count || 0 }} / </span>
                        <span>{{ value || '-' }}</span>
                    </p>
                    <p-i v-if="item.linked_count !== item.data_source_account_count"
                         class="menu-button"
                         :name="'ic_error-filled'"
                         height="0.875rem"
                         width="0.875rem"
                         :color="red[300]"
                    />
                </div>
            </template>
            <template #col-connected_workspace_count-format="{value}">
                <span>{{ value || 0 }}</span>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.data-source-management-table {
    .table {
        .col-name {
            @apply flex items-center;
            gap: 0.5rem;
        }
        .col-data-source-account-count {
            @apply flex items-center;
            gap: 0.25rem;
        }
    }
}
</style>
