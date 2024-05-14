<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToolboxTable, PLazyImg } from '@spaceone/design-system';
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { useQueryTags } from '@/common/composables/query-tags';

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
    selectedIndices: computed<number[]>(() => dataSourcesPageState.selectedDataSourceIndices),
});
const state = reactive({
    loading: false,
});
const tableState = reactive({
    pageStart: 0,
    pageLimit: 15,
    searchFilters: [] as ConsoleFilter[],
    fields: computed(() => [
        {
            name: 'name',
            label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_DATASOURCE'),
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
            label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_LINKED_ACCOUNT'),
            type: 'item',
            sortable: false,
        },
        {
            name: 'connected_workspace_count',
            label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_WORKSPACE'),
            type: 'item',
            sortable: false,
        },
        {
            name: 'created_at',
            label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_TIME'),
            type: 'item',
            sortable: false,
        },
    ]),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'data_source_id', label: 'ID' },
            { name: 'created_at', label: 'Created' },
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
        tableState.searchFilters = datasourceListApiQueryHelper.filters;
    }
    if (options.pageStart !== undefined) tableState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) tableState.pageLimit = options.pageLimit;
    fetchDataSourceList();
};

const fetchDataSourceList = async () => {
    datasourceListApiQueryHelper.setPage(tableState.pageStart, tableState.pageLimit)
        .setFilters(tableState.searchFilters);
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
                         @refresh="handleChange()"
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
            <template #col-data_source_account_count-format="{value}">
                <span>{{ value || 0 }}</span>
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
    }
}
</style>
