<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PToolboxTable, PHeading, PI, PHeadingLayout, PSelectStatus,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/src/data-display/tables/definition-table/type';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/navigation/toolbox/type';

import type { CostJobStatus } from '@/schema/cost-analysis/job/type';
import { i18n } from '@/translations';

import { useQueryTags } from '@/common/composables/query-tags';

import {
    blue, gray, green, red,
} from '@/styles/colors';

import DataSourceManagementTabDataCollectionHistoryModal
    from '@/services/cost-explorer/components/DataSourceManagementTabDataCollectionHistoryModal.vue';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type {
    DataSourceItem, CostJobItem, CostJobStatusInfo, DataCollectionHistoryModalType,
} from '@/services/cost-explorer/types/data-sources-type';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    selectedItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),
    jobList: computed<CostJobItem[]>(() => dataSourcesPageGetters.jobList),
    totalCount: computed<number>(() => dataSourcesPageState.jobListTotalCount),
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
    selectedDataSourceItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedDataSourceItem),
});
const state = reactive({
    loading: false,
    modalVisible: false,
    modalType: '' as DataCollectionHistoryModalType,
    selectedJobId: '',
    selectedJobItem: computed<CostJobItem|undefined>(() => storeState.jobList.find((item) => item.job_id === state.selectedJobId)),
});
const tableState = reactive({
    pageStart: 0,
    pageLimit: 15,
    fields: computed<DefinitionField[]>(() => [
        { name: 'job_id', label: 'Job ID', sortable: false },
        { name: 'status', label: 'Status', sortable: false },
        { name: 'total_tasks', label: 'Total Task', sortable: false },
        { name: 'created_at', label: 'Created' },
        { name: 'finished_at', label: 'Finished', sortable: false },
        { name: 'duration', label: 'Duration', sortable: false },
    ]),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'job_id', label: 'Job ID' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    }]),
    valueHandlerMap: computed<ValueHandlerMap>(() => {
        const resourceType = 'cost_analysis.Job';
        return {
            job_id: makeDistinctValueHandler(resourceType, 'job_id', 'string', [{ k: 'data_source_id', v: storeState.selectedDataSourceItem.data_source_id, o: 'eq' }]),
            created_at: makeDistinctValueHandler(resourceType, 'created_at', 'datetime', [{ k: 'data_source_id', v: storeState.selectedDataSourceItem.data_source_id, o: 'eq' }]),
        };
    }),
    searchFilters: [] as ConsoleFilter[],
    filterFields: computed(() => [
        { name: 'ALL', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ALL') },
        { name: 'IN_PROGRESS', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.IN_PROGRESS') },
        { name: 'SUCCESS', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SUCCESS') },
        { name: 'TIMEOUT', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TIMEOUT') },
        { name: 'FAILURE', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.FAILURE') },
        { name: 'CANCELED', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.CANCELED') },
    ]),
    selectedStatusFilter: 'ALL',
});

const getStatusInfo = (value: CostJobStatus): CostJobStatusInfo => {
    let info = {} as CostJobStatusInfo;
    switch (value) {
    case 'SUCCESS':
        info = {
            icon: 'ic_check',
            color: green[600],
            text: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.SUCCESS'),
        };
        break;
    case 'CANCELED':
        info = {
            icon: 'ic_limit-filled',
            color: gray[400],
            text: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.CANCELED'),
        };
        break;
    case 'TIMEOUT':
        info = {
            icon: 'ic_error-filled',
            color: red[400],
            text: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TIMEOUT'),
        };
        break;
    case 'FAILURE':
        info = {
            icon: 'ic_error-filled',
            color: red[400],
        };
        break;
    case 'IN_PROGRESS':
        info = {
            icon: 'ic_peacock-gradient-circle',
            color: blue[400],
            text: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.IN_PROGRESS'),
        };
        break;
    default:
        break;
    }
    return info;
};
const handleClickErrorDetail = (jobId: string) => {
    state.modalVisible = true;
    state.modalType = 'ERROR';
    state.selectedJobId = jobId;
};
const handleClickResyncButton = () => {
    state.modalVisible = true;
    state.modalType = 'RE-SYNC';
};
const handleSelectStatus = (selected: string) => {
    tableState.selectedStatusFilter = selected;
};

let jobListApiQueryHelper = new ApiQueryHelper();
let jobListApiQuery = jobListApiQueryHelper.data;
const queryTagHelper = useQueryTags({ keyItemSets: tableState.keyItemSets });
const { queryTags } = queryTagHelper;

const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options) {
        jobListApiQuery = getApiQueryWithToolboxOptions(jobListApiQueryHelper, options) ?? jobListApiQuery;

        if (options.sortBy !== undefined) {
            jobListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
        }
        if (options.queryTags !== undefined) {
            tableState.searchFilters = jobListApiQueryHelper.filters;
        }
        if (options.pageStart !== undefined) tableState.pageStart = options.pageStart;
        if (options.pageLimit !== undefined) tableState.pageLimit = options.pageLimit;
    }
    await fetchJobList();
};
const fetchJobList = async () => {
    state.loading = true;
    try {
        jobListApiQueryHelper.setPage(tableState.pageStart, tableState.pageLimit)
            .setFilters(tableState.searchFilters);
        await dataSourcesPageStore.fetchJobList({
            data_source_id: storeState.selectedItem?.data_source_id || '',
            query: jobListApiQueryHelper.data,
        });
    } finally {
        state.loading = false;
    }
};

watch(() => tableState.selectedStatusFilter, async (selectedStatusFilter) => {
    if (selectedStatusFilter === 'ALL') {
        jobListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
    } else {
        jobListApiQueryHelper.setOrFilters([{ k: 'status', v: selectedStatusFilter, o: '=' }]);
    }

    await fetchJobList();
}, { immediate: true });
watch([() => storeState.activeTab, () => storeState.selectedItem], async () => {
    tableState.pageStart = 0;
    tableState.pageLimit = 15;
    tableState.selectedStatusFilter = 'ALL';
    await fetchJobList();
}, { immediate: true });
</script>

<template>
    <div class="data-source-management-tab-data-collection-history">
        <p-heading-layout class="pt-8 px-4">
            <template #heading>
                <p-heading heading-type="sub"
                           use-total-count
                           :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_COLLECTION_HISTORY')"
                           :total-count="storeState.totalCount"
                />
            </template>
            <template #extra>
                <p-button style-type="tertiary"
                          @click="handleClickResyncButton"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.RESYNC') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-toolbox-table :fields="tableState.fields"
                         :items="storeState.jobList"
                         :loading="state.loading"
                         :total-count="storeState.totalCount"
                         class="data-source-definition-table"
                         searchable
                         search-type="query"
                         sortable
                         sort-by="created_at"
                         :sort-desc="false"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         :query-tags="queryTags"
                         @refresh="fetchJobList()"
                         @change="handleChangeToolbox"
        >
            <template #toolbox-bottom>
                <div class="status-box">
                    <span class="label">{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.STATUS') }}</span>
                    <p-select-status v-for="(status, idx) in tableState.filterFields"
                                     :key="idx"
                                     :selected="tableState.selectedStatusFilter"
                                     :value="status.name"
                                     :multi-selectable="false"
                                     @change="handleSelectStatus"
                    >
                        {{ status.label }}
                    </p-select-status>
                </div>
            </template>
            <template #col-status-format="{value, item}">
                <p-i :name="getStatusInfo(value).icon"
                     :color="getStatusInfo(value).color"
                     width="1rem"
                     height="1rem"
                     class="icon-info"
                />
                <p-button v-if="value === 'FAILURE'"
                          size="sm"
                          style-type="tertiary"
                          @click="handleClickErrorDetail(item.job_id)"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND') }}
                </p-button>
                <span v-else>
                    {{ getStatusInfo(value).text }}
                </span>
            </template>
        </p-toolbox-table>
        <data-source-management-tab-data-collection-history-modal v-if="state.modalVisible"
                                                                  :modal-visible.sync="state.modalVisible"
                                                                  :modal-type="state.modalType"
                                                                  :selected-job-item="state.selectedJobItem"
        />
    </div>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-data-collection-history {
    .title {
        @apply items-center;

        /* custom design-system component - p-toolbox */
        :deep(.p-toolbox) {
            .tools-wrapper {
                margin-bottom: -0.325rem;
            }
            .tool {
                margin-bottom: 0;
            }
        }
    }
    .data-source-definition-table {
        border: none;
        .status-box {
            @apply relative inline-flex gap-4 items-center;
            height: 1.25rem;
            font-size: 0.875rem;
            margin-top: -0.5rem;
            margin-bottom: 1rem;
            padding-left: 1rem;

            .label {
                @apply text-gray-500;
                font-size: 0.875rem;
            }
        }
        .icon-info {
            margin-right: 0.5rem;
        }
    }
}
</style>

