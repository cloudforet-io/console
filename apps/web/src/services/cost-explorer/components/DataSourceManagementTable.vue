<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PLazyImg, PI, PStatus,
} from '@cloudforet/mirinae';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';

import { useUserStore } from '@/store/user/user-store';

import { useQueryTags } from '@/common/composables/query-tags';

import { red } from '@/styles/colors';

import { datasourceStateFormatter } from '@/services/cost-explorer/composables/data-source-handler';
import { useDataSourceAccountAnalyzeQuery } from '@/services/cost-explorer/composables/use-data-source-account-analyze-query';
import { useDataSourceListQuery } from '@/services/cost-explorer/composables/use-data-source-list-query';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const dataSourcesPageStore = useDataSourcesPageStore();
const referenceMap = useAllReferenceDataModel();
const userStore = useUserStore();

const state = reactive({
    sortKey: 'name',
    sortDesc: false,
    pageSize: 15,
    thisPage: 1,
    selectedIndex: undefined as number|undefined,
});
const tableState = reactive({
    fields: computed(() => [
        {
            name: 'name',
            label: 'Name',
            type: 'item',
        },
        {
            name: 'data_source_id',
            label: 'ID',
            type: 'item',
            sortable: false,
        },
        {
            name: 'schedule.state',
            label: 'State',
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
const selectedIndex = computed<number[]>(() => {
    if (state.selectedIndex === undefined) return [];
    return [state.selectedIndex];
});

const datasourceListApiQueryHelper = new ApiQueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

/* Query */
const {
    dataSourceListData, totalCount, isLoading, refetch,
} = useDataSourceListQuery({
    params: computed(() => {
        datasourceListApiQueryHelper
            .setFilters(queryTagHelper.filters.value)
            .setSort(state.sortKey, state.sortDesc);
        return {
            query: datasourceListApiQueryHelper.data,
        };
    }),
    thisPage: computed(() => state.thisPage),
    pageSize: computed(() => state.pageSize),
});
const { costDataSourceAccountAnalyzeData } = useDataSourceAccountAnalyzeQuery({
    query: {
        group_by: ['data_source_id'],
        fields: {
            workspaceList: {
                key: 'workspace_id',
                operator: 'push',
            },
        },
    },
});

/* Util */
const getLinkedAccountCount = (dataSourceId: string): number => {
    const analyzeDataResults = costDataSourceAccountAnalyzeData.value?.results || [];
    const matchingItem = analyzeDataResults.find((entry) => entry.data_source_id === dataSourceId);
    if (matchingItem) {
        const linkedCount = matchingItem.workspaceList?.filter((id) => id !== null).length;
        return linkedCount || 0;
    }
    return 0;
};

/* Event Handler */
const handleUpdateSelectIndex = async (indices: number[]) => {
    const item = dataSourceListData.value?.results?.[indices[0]];
    state.selectedIndex = indices[0];
    dataSourcesPageStore.setSelectedDataSourceId(item?.data_source_id);
};
const handleChange = (options: any = {}) => {
    if (options?.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
    state.selectedIndex = undefined;
    dataSourcesPageStore.setSelectedDataSourceId(undefined);
};
</script>

<template>
    <section class="data-source-management-table">
        <p-toolbox-table class="table"
                         search-type="query"
                         searchable
                         selectable
                         sortable
                         :sort-by.sync="state.sortKey"
                         :sort-desc.sync="state.sortDesc"
                         :multi-select="false"
                         :select-index="selectedIndex"
                         :fields="tableState.fields"
                         :items="dataSourceListData?.results || []"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         :loading="isLoading"
                         :total-count="totalCount"
                         :this-page.sync="state.thisPage"
                         :page-size.sync="state.pageSize"
                         :style="{height: `${props.tableHeight}px`}"
                         @change="handleChange"
                         @refresh="refetch()"
                         @update:select-index="handleUpdateSelectIndex"
        >
            <template #col-name-format="{value, item}">
                <div class="col-name">
                    <p-lazy-img class="left-icon"
                                :src="referenceMap.plugin[item.plugin_info?.plugin_id || '']?.icon"
                                width="1.5rem"
                                height="1.5rem"
                    />
                    <span>{{ value }}</span>
                </div>
            </template>
            <template #col-created_at-format="{value}">
                <span>{{ dayjs.utc(value).tz(userStore.state.timezone).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="datasourceStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-data_source_account_count-format="{value, item}">
                <div v-if="getLinkedAccountCount(item.data_source_id)"
                     class="col-data-source-account-count"
                >
                    <p>
                        <span>{{ getLinkedAccountCount(item.data_source_id) }} / </span>
                        <span>{{ value || 0 }}</span>
                    </p>
                    <p-i v-if="value && getLinkedAccountCount(item.data_source_id) !== value"
                         class="menu-button"
                         :name="'ic_error-filled'"
                         height="0.875rem"
                         width="0.875rem"
                         :color="red[300]"
                    />
                </div>
                <div v-else>
                    <span>{{ value || 0 }}</span>
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
