<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    makeEnumValueHandler, makeDistinctValueHandler, makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PPagination, PLazyImg,
    PSelectButtonGroup, PStatus, PToolboxTable,
} from '@cloudforet/mirinae';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { durationFormatter, iso8601Formatter } from '@cloudforet/utils';

import type { JobModel } from '@/api-clients/inventory/job/schema/model';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { useQueryTags } from '@/common/composables/query-tags';

import NoCollectorModal from '@/services/asset-inventory/components/CollectorHistoryNoCollectorModal.vue';
import { useInventoryJobListPaginationQuery } from '@/services/asset-inventory/composables/use-inventory-job-list-pagination-query';
import { JOB_STATE } from '@/services/asset-inventory/constants/collector-constant';
import {
    statusClassFormatter,
    statusIconColorFormatter,
    statusIconFormatter,
    statusTextColorFormatter,
    statusTextFormatter,
} from '@/services/asset-inventory/helpers/collector-history-formatter-helper';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { JOB_SELECTED_STATUS } from '@/services/asset-inventory/types/collector-history-page-type';


const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const fields: DataTableField[] = [
    { label: 'Job ID', name: 'job_id' },
    { label: 'Collector', name: 'collector_info.label', sortable: false },
    { label: 'Plugin', name: 'collector_info.plugin_info', sortable: false },
    { label: 'Status', name: 'status', sortable: false },
    { label: 'Job Progress', name: 'progress', sortable: false },
    { label: 'Total Task', name: 'total_tasks' },
    { label: 'Created', name: 'created_at' },
    { label: 'Duration', name: 'duration', sortable: false },
];
const statusList = computed(() => [
    { name: JOB_SELECTED_STATUS.ALL, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.ALL') },
    { name: JOB_SELECTED_STATUS.PROGRESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.IN_PROGRESS') },
    { name: JOB_SELECTED_STATUS.SUCCESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.SUCCESS') },
    { name: JOB_SELECTED_STATUS.FAILURE, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.FAILURE') },
    { name: JOB_SELECTED_STATUS.CANCELED, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.CANCELED') },
]);

const handlers = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'job_id', label: 'Job ID' },
            { name: 'status', label: 'Status' },
            { name: 'collector_id', label: 'Collector', valueSet: storeState.collectors },
            { dataType: 'datetime', name: 'created_at', label: 'Created Time' },
        ],
    }]),
    valueHandlerMap: {
        job_id: makeDistinctValueHandler('inventory.Job', 'job_id'),
        status: makeEnumValueHandler(JOB_STATE),
        collector_id: makeReferenceValueHandler('inventory.Collector'),
    },
});
const storeState = reactive({
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    collectors: computed<CollectorReferenceMap>(() => allReferenceStore.getters.collector),
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
});
const state = reactive({
    modalVisible: false,
    thisPage: 1,
    pageSize: 30,
    selectedStatus: 'ALL',
    sortBy: 'created_at',
    sortDesc: true,
});
const items = computed<JobModel[]>(() => (jobListData.value?.results ?? []).map((job) => {
    const collector = storeState.collectors[job.collector_id];
    const plugin = storeState.plugins[job.plugin_id];
    let progress;
    if (job.total_tasks === 0 || job.total_tasks === undefined) {
        if (job.status === JOB_STATE.SUCCESS) progress = { succeededPercentage: 100, failedPercentage: 0, processPercentage: 100 };
        else if (job.status === JOB_STATE.FAILURE) progress = { succeededPercentage: 0, failedPercentage: 100, processPercentage: 100 };
        else progress = { succeededPercentage: 0, failedPercentage: 0, processPercentage: 100 };
    } else {
        const remainedTasks = job.remained_tasks ?? 0;
        const totalTasks = job.total_tasks ?? 0;
        const successTasks = job.success_tasks ?? 0;
        const failureTasks = job.failure_tasks ?? 0;
        progress = {
            succeededPercentage: ((successTasks / totalTasks) * 100),
            failedPercentage: ((failureTasks / totalTasks) * 100),
            isCanceled: job.status === JOB_STATE.CANCELED,
            processPercentage: ((totalTasks - remainedTasks) / totalTasks) * 100,
        };
    }
    return {
        ...job,
        total_tasks: job.total_tasks ?? 0,
        collector_info: {
            label: collector?.name,
            plugin_info: {
                label: plugin?.label,
                icon: plugin?.icon,
            },
        },
        progress,
        created_at: job.created_at ? iso8601Formatter(job.created_at, storeState.timezone) : '--',
        duration: job.created_at ? durationFormatter(job.created_at, job.finished_at, storeState.timezone) : '--',
    };
}));

const queryTagsHelper = useQueryTags({
    keyItemSets: handlers.keyItemSets,
    referenceStore: {
        'inventory.Collector': computed(() => allReferenceStore.getters.collector),
    },
});
const { queryTags, filters: searchFilters } = queryTagsHelper;
const apiQueryHelper = new ApiQueryHelper();

/* Query */
const {
    data: jobListData,
    isLoading: isJobListLoading,
    totalCount: jobListTotalCount,
    isSuccess: isJobListSuccess,
    refetch: refetchJobList,
} = useInventoryJobListPaginationQuery({
    params: computed(() => {
        apiQueryHelper
            .setFilters(searchFilters.value)
            .setSort(state.sortBy, state.sortDesc);

        let statusValues: string[] = [];
        if (state.selectedStatus === JOB_SELECTED_STATUS.PROGRESS) {
            statusValues = [JOB_STATE.IN_PROGRESS];
        } else if (state.selectedStatus === JOB_SELECTED_STATUS.SUCCESS) {
            statusValues = [JOB_STATE.SUCCESS];
        } else if (state.selectedStatus === JOB_SELECTED_STATUS.FAILURE) {
            statusValues = [JOB_STATE.FAILURE];
        } else if (state.selectedStatus === JOB_SELECTED_STATUS.CANCELED) {
            statusValues = [JOB_STATE.CANCELED];
        }

        if (statusValues.length > 0) {
            apiQueryHelper.addFilter({ k: 'status', v: statusValues, o: '=' });
        }

        return {
            query: apiQueryHelper.data,
        };
    }),
    thisPage: computed(() => state.thisPage),
    pageSize: computed(() => state.pageSize),
});

/* Components */
const handleSelect = (item) => {
    SpaceRouter.router.push({
        name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
        params: { jobId: item.job_id },
    }).catch(() => {});
};
const handleChange = async (options: ToolboxOptions = {}) => {
    if (options.queryTags) {
        queryTagsHelper.setQueryTags(options.queryTags);
        await replaceUrlQuery('filters', queryTagsHelper.getURLQueryStringFilters());
    }
};

/* Watcher */
watch(() => state.selectedStatus, (selectedStatus) => {
    state.selectedStatus = selectedStatus;
    state.thisPage = 1;
});
watch(isJobListSuccess, (isSuccess) => {
    if (isSuccess && jobListTotalCount.value === 0 && state.selectedStatus === JOB_SELECTED_STATUS.ALL) {
        state.modalVisible = true;
    }
});

/* Init */
(async () => {
    const currentQuery = SpaceRouter.router.currentRoute.query;
    queryTagsHelper.setURLQueryStringFilters(currentQuery.filters);
})();
</script>

<template>
    <div class="collector-history-page">
        <p-heading class="mb-6"
                   :title="$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <div class="collector-history-table">
            <div class="status-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}</span>
                <p-select-button-group class="select-button-group"
                                       :buttons="statusList"
                                       :selected.sync="state.selectedStatus"
                                       theme="text"
                />
            </div>
            <p-toolbox-table search-type="query"
                             :fields="fields"
                             :items="items"
                             :query-tags="queryTags"
                             :key-item-sets="handlers.keyItemSets"
                             :value-handler-map="handlers.valueHandlerMap"
                             :loading="isJobListLoading"
                             :total-count="jobListTotalCount"
                             :this-page.sync="state.thisPage"
                             :page-size.sync="state.pageSize"
                             row-cursor-pointer
                             sortable
                             :sort-by.sync="state.sortBy"
                             :sort-desc.sync="state.sortDesc"
                             :selectable="false"
                             :exportable="false"
                             :class="items.length === 0 ? 'no-data' : ''"
                             :style="{height: '100%', border: 'none'}"
                             @change="handleChange"
                             @refresh="refetchJobList"
                             @rowLeftClick="handleSelect"
            >
                <template #[`col-collector_info.plugin_info-format`]="{ value }">
                    <template v-if="value">
                        <div class="col-plugin-info">
                            <p-lazy-img :src="value.icon || ''"
                                        width="1rem"
                                        height="1rem"
                                        class="mr-2"
                            />
                            {{ value.label || '' }}
                        </div>
                    </template>
                </template>
                <template #col-status-format="{ value }">
                    <p-status
                        :text="statusTextFormatter(value)"
                        :text-color="statusTextColorFormatter(value)"
                        :icon="statusIconFormatter(value)"
                        :icon-color="statusIconColorFormatter(value)"
                        :icon-animation="value === JOB_STATE.IN_PROGRESS ? 'spin' : undefined"
                        :class="statusClassFormatter(value)"
                    />
                </template>
                <template #col-progress-format="{ value }">
                    <div :class="['col-progress-format', {'is-canceled': value.isCanceled}]">
                        <span class="succeeded-bar"
                              :style="{ width: `${value.succeededPercentage}%` }"
                        />
                        <span class="failed-bar"
                              :style="{ width: `${value.failedPercentage}%` }"
                        />
                    </div>
                    <span class="succeeded-text">{{ Math.floor(value.processPercentage) }}%</span>
                </template>
            </p-toolbox-table>
            <div v-if="items.length > 0"
                 class="pagination"
            >
                <p-pagination :total-count="jobListTotalCount"
                              :this-page.sync="state.thisPage"
                              :page-size.sync="state.pageSize"
                />
            </div>
        </div>
        <no-collector-modal :visible.sync="state.modalVisible"
                            @confirm="$router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME })"
        />
    </div>
</template>

<style lang="postcss" scoped>
.collector-history-page {
    .collector-history-table {
        @apply bg-white border border-gray-200 rounded-lg;
        margin-top: 1rem;
        .status-wrapper {
            @apply flex items-center;
            margin-left: 1rem;
            margin-top: 1.5rem;
            gap: 1rem;
            .label {
                font-size: 0.875rem;
                font-weight: bold;
                line-height: 1.5;
            }

            /* custom design-system component - p-select-button-group */
            :deep(.select-button-group) {
                .button-group {
                    @apply flex;
                    gap: 1rem;
                    .select-button {
                        padding: 0;
                        margin-right: 0;
                    }
                }
            }
        }

        /* custom design-system component - p-toolbox-table */
        :deep(.p-toolbox-table) {
            &.no-data {
                .p-data-table {
                    min-height: 18.75rem;
                }
            }
        }
        .col-progress-format {
            @apply inline-flex items-center bg-gray-200;
            width: 6rem;
            height: 0.5rem;
            margin-right: 0.25rem;
            border-radius: 0.125rem;
            > span {
                &:first-child {
                    border-top-left-radius: 0.125rem;
                    border-bottom-left-radius: 0.125rem;
                }
                &:last-child {
                    border-top-right-radius: 0.125rem;
                    border-bottom-right-radius: 0.125rem;
                }
            }
            .succeeded-bar {
                @apply bg-green-500;
                height: 100%;
            }
            .failed-bar {
                @apply bg-red-400;
                height: 100%;
            }
            &.is-canceled {
                .succeeded-bar, .failed-bar {
                    @apply bg-gray-400;
                }
            }
        }
        .col-plugin-info {
            @apply flex items-center;
        }
        .succeeded-text {
            @apply text-gray-700;
        }
        .pagination {
            text-align: center;
            padding-top: 1.5rem;
            bottom: 0;
            margin-bottom: 1.5rem;
        }
    }
}
</style>
