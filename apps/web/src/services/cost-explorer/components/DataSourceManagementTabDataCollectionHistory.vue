<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PToolboxTable, PHeading, PI, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/src/data-display/tables/definition-table/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/navigation/toolbox/type';



import type { CostJobStatus } from '@/schema/cost-analysis/job/type';
import { i18n } from '@/translations';

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
        { name: 'job_id', label: 'Job ID' },
        { name: 'status', label: 'Status' },
        { name: 'total_tasks', label: 'Total Task' },
        { name: 'created_at', label: 'Created' },
        { name: 'finished_at', label: 'Finished' },
        { name: 'duration', label: 'Duration' },
    ]),
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

const jobListApiQueryHelper = new ApiQueryHelper();
const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.pageStart !== undefined) tableState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) tableState.pageLimit = options.pageLimit;
    await fetchJobList();
};
const fetchJobList = async () => {
    state.loading = true;
    try {
        jobListApiQueryHelper.setPage(tableState.pageStart, tableState.pageLimit);
        await dataSourcesPageStore.fetchJobList({
            data_source_id: storeState.selectedItem?.data_source_id || '',
            query: jobListApiQueryHelper.data,
        });
    } finally {
        state.loading = false;
    }
};

watch([() => storeState.activeTab, () => storeState.selectedItem], async () => {
    tableState.pageStart = 0;
    tableState.pageLimit = 15;
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
                         class="data-source-definition-table"
                         :total-count="storeState.totalCount"
                         @refresh="fetchJobList()"
                         @change="handleChangeToolbox"
        >
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
        .icon-info {
            margin-right: 0.5rem;
        }
    }
}
</style>

