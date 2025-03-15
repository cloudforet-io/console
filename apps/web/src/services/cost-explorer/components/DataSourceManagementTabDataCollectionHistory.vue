<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PToolboxTable, PHeading, PHeadingLayout, PSelectStatus, PProgressBar, PStatus,
} from '@cloudforet/mirinae';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import type { CostJobStatus } from '@/api-clients/cost-analysis/job/schema/type';
import { i18n } from '@/translations';

import { useQueryTags } from '@/common/composables/query-tags';

import {
    gray, green, red,
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
    dataSourceLoading: computed<boolean>(() => dataSourcesPageState.dataSourceLoading),
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
    hasInProgressItem: computed<boolean>(() => storeState.jobList.some((item) => item.status === 'IN_PROGRESS')),
});
const tableState = reactive({
    pageStart: 0,
    pageLimit: 15,
    fields: computed<DefinitionField[]>(() => [
        { name: 'job_id', label: 'Job ID', sortable: false },
        { name: 'status', label: 'Status', sortable: false },
        { name: 'progress', label: 'Job Progress', sortable: false },
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
            text: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.FAILURE'),
        };
        break;
    case 'IN_PROGRESS':
        info = {
            icon: 'ic_peacock-gradient-circle',
            color: undefined,
            text: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.IN_PROGRESS'),
        };
        break;
    default:
        break;
    }
    return info;
};
const getRemainedTasksPercentage = (item: CostJobItem) => {
    const remainedTasks = item?.remained_tasks || 0;
    const totalTasks = item?.total_tasks || 0;

    if (item.status === 'IN_PROGRESS') {
        const percentage = ((totalTasks - remainedTasks) / totalTasks) * 100;
        return percentage % 1 === 0 ? percentage : parseFloat(percentage.toFixed(2));
    }

    if (item.status === 'SUCCESS') {
        return 100;
    }

    return 0;
};

const handleClickCancelDetail = (jobId: string) => {
    state.modalVisible = true;
    state.modalType = 'CANCEL';
    state.selectedJobId = jobId;
};
const handleClickErrorDetail = (jobId: string) => {
    state.modalVisible = true;
    state.modalType = 'ERROR';
    state.selectedJobId = jobId;
};
const handleClickResyncButton = () => {
    state.modalVisible = true;
    // NOTE: If the latest job is in progress, it can be canceled and restarted only if 10 minutes have passed since the start time.
    state.modalType = state.hasInProgressItem ? 'RESTART' : 'RE-SYNC';
};
const handleSelectStatus = (selected: string) => {
    tableState.selectedStatusFilter = selected;
};
const handleConfirmModal = () => {
    fetchJobList();
};
const initJobTableData = async () => {
    tableState.pageStart = 0;
    tableState.pageLimit = 15;
    tableState.selectedStatusFilter = 'ALL';
    await fetchJobList();
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
});
watch(() => storeState.selectedItem, () => {
    if (storeState.dataSourceLoading) return;
    state.loading = true;
    tableState.selectedStatusFilter = 'ALL';
    initJobTableData();
});

onMounted(() => {
    tableState.selectedStatusFilter = 'ALL';
    initJobTableData();
});
onUnmounted(() => {
    dataSourcesPageStore.jobReset();
});
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
            <template v-if="storeState.selectedDataSourceItem.schedule.state === 'ENABLED'"
                      #extra
            >
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
                <p-status :icon="getStatusInfo(value).icon"
                          :icon-color="getStatusInfo(value).color"
                          :icon-animation="value === 'IN_PROGRESS' ? 'spin' : undefined"
                >
                    <span class="ml-1">
                        {{ getStatusInfo(value).text }}
                    </span>
                    <p-button v-if="value === 'FAILURE'"
                              size="sm"
                              style-type="tertiary"
                              class="ml-2"
                              @click="handleClickErrorDetail(item.job_id)"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND') }}
                    </p-button>
                    <p-button v-if="storeState.selectedDataSourceItem.schedule.state === 'ENABLED' && value === 'IN_PROGRESS'"
                              size="sm"
                              style-type="tertiary"
                              class="ml-2"
                              @click="handleClickCancelDetail(item.job_id)"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.CANCEL') }}
                    </p-button>
                </p-status>
            </template>
            <template #col-progress-format="{item}">
                <div class="col-progress-bar">
                    <p-progress-bar :percentage="getRemainedTasksPercentage(item)"
                                    :color="green[500]"
                                    size="md"
                                    class="status-progress-bar"
                    />
                    <span>{{ getRemainedTasksPercentage(item) }}%</span>
                </div>
            </template>
        </p-toolbox-table>
        <data-source-management-tab-data-collection-history-modal v-if="state.modalVisible"
                                                                  :modal-visible.sync="state.modalVisible"
                                                                  :modal-type="state.modalType"
                                                                  :selected-job-item="state.selectedJobItem"
                                                                  @confirm="handleConfirmModal"
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
        .col-progress-bar {
            @apply flex items-center;
            gap: 0.25rem;
            .status-progress-bar {
                width: 6rem;
            }
        }
    }
}
</style>

