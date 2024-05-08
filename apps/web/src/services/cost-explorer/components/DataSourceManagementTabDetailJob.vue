<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PButtonModal,
    PDataTable, PHeading, PI, PTextEditor, PToolbox,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/src/data-display/tables/definition-table/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { CostJobStatus } from '@/schema/cost-analysis/job/type';
import { i18n } from '@/translations';

import { gray, green, red } from '@/styles/colors';

import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';
import type { DataSourceItem, CostJobItem, CostJobStatusInfo } from '@/services/cost-explorer/types/data-sources-type';

const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;
const dataSourcesPageGetters = dataSourcesPageStore.getters;

const storeState = reactive({
    selectedItem: computed<DataSourceItem>(() => dataSourcesPageGetters.selectedItem),
    jobList: computed<CostJobItem[]>(() => dataSourcesPageGetters.jobList),
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
});
const state = reactive({
    loading: false,
    modalVisible: false,
    selectedJobId: '',
    selectedJobItem: computed<CostJobItem|undefined>(() => storeState.jobList.find((item) => item.job_id === state.selectedJobId)),
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'job_id', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_ID') },
        { name: 'status', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_STATUS') },
        { name: 'total_tasks', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_TOTAL_TASK') },
        { name: 'created_at', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_CREATED_AT') },
        { name: 'duration', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.COL_JOB_DURATION') },
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
    default:
        break;
    }
    return info;
};
const handleClickErrorDetail = (jobId: string) => {
    state.modalVisible = true;
    state.selectedJobId = jobId;
};

const jobListApiQueryHelper = new ApiQueryHelper();
const handleChangeToolbox = (options: ToolboxOptions) => {
    if (options.pageStart !== undefined) jobListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) jobListApiQueryHelper.setPageLimit(options.pageLimit);
    fetchJobList();
};
const fetchJobList = () => {
    state.loading = true;
    try {
        dataSourcesPageStore.fetchJobList({
            data_source_id: storeState.selectedItem?.data_source_id || '',
            query: jobListApiQueryHelper.data,
        });
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.activeTab, () => {
    fetchJobList();
}, { immediate: true });
</script>

<template>
    <div class="data-source-management-tab-detail-base-information">
        <p-heading heading-type="sub"
                   use-total-count
                   :title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_COLLECTION_JOB')"
                   :total-count="storeState.jobList.length"
                   class="title"
        >
            <template #extra>
                <p-toolbox :searchable="false"
                           @change="handleChangeToolbox"
                           @refresh="fetchJobList()"
                />
            </template>
        </p-heading>
        <p-data-table :fields="tableState.fields"
                      :items="storeState.jobList"
                      style-type="white"
                      :loading="state.loading"
                      class="data-source-definition-table"
                      v-on="$listeners"
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
        </p-data-table>
        <p-button-modal
            :header-title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_TITLE')"
            centered
            size="md"
            fade
            backdrop
            hide-footer-close-button
            :visible.sync="state.modalVisible"
            @confirm="state.modalVisible = false"
        >
            <template #body>
                <div class="content">
                    <p class="error-info">
                        {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_CODE') }}:
                        <span class="error-code">
                            {{ state.selectedJobItem.error_code }}
                        </span>
                    </p>
                    <p-text-editor read-only
                                   :code="state.selectedJobItem.error_message"
                    />
                </div>
            </template>
            <template #confirm-button>
                <span>{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_OK') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-detail-base-information {
    .title {
        @apply items-center;
        margin-top: 2.25rem;

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
        padding-top: 0.5rem;
        .icon-info {
            margin-right: 0.5rem;
        }
    }

    .content {
        @apply flex flex-col;
        padding-top: 1rem;
        padding-bottom: 0.75rem;
        gap: 1rem;
        .error-info {
            @apply flex items-center text-label-md font-bold;
            gap: 0.5rem;
            .error-code {
                @apply text-code-md text-red-600 font-normal bg-gray-100 border border-gray-200;
                padding-right: 0.375rem;
                padding-left: 0.375rem;
                border-radius: 0.25rem;
            }
        }
    }

    /* custom design-system component - p-button-modal */
    :deep(.p-button-modal) {
        .modal-header {
            min-height: unset;
            margin-bottom: 1rem;
        }
    }

    /* custom design-system component - p-text-editor */
    :deep(.p-text-editor) {
        .CodeMirror {
            border-radius: 0.375rem;
        }
    }
}
</style>

