<script setup lang="ts">
import { iso8601Formatter, durationFormatter } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import {
    makeEnumValueHandler, makeDistinctValueHandler, makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PPagination, PLazyImg,
    PSelectButtonGroup, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import { useQueryTags } from '@/common/composables/query-tags';

import {
    statusClassFormatter,
    statusIconColorFormatter,
    statusIconFormatter,
    statusTextColorFormatter,
    statusTextFormatter,
} from '@/services/asset-inventory/collector/collector-history/lib/formatter-helper';
import NoCollectorModal from '@/services/asset-inventory/collector/collector-history/modules/NoCollectorModal.vue';
import { JOB_SELECTED_STATUS } from '@/services/asset-inventory/collector/collector-history/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const store = useStore();
const { t } = useI18n();
const router = useRouter();

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
    { name: JOB_SELECTED_STATUS.ALL, label: t('INVENTORY.COLLECTOR.HISTORY.ALL') },
    { name: JOB_SELECTED_STATUS.PROGRESS, label: t('INVENTORY.COLLECTOR.HISTORY.IN_PROGRESS') },
    { name: JOB_SELECTED_STATUS.SUCCESS, label: t('INVENTORY.COLLECTOR.HISTORY.SUCCESS') },
    { name: JOB_SELECTED_STATUS.FAILURE, label: t('INVENTORY.COLLECTOR.HISTORY.FAILURE') },
    { name: JOB_SELECTED_STATUS.CANCELED, label: t('INVENTORY.COLLECTOR.HISTORY.CANCELED') },
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
    timezone: computed(() => store.state.user.timezone),
    collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});
const state = reactive({
    loading: true,
    modalVisible: false,
    pageStart: 1,
    pageSize: 30,
    thisPage: 1,
    totalCount: 0,
    hasManagePermission: useManagePermissionState(),
    isDomainOwner: computed(() => store.state.user.userType === 'DOMAIN_OWNER'),
    selectedStatus: 'ALL',
    items: [] as any[],
    sortBy: 'created_at',
});

const queryTagsHelper = useQueryTags({
    keyItemSets: handlers.keyItemSets,
    referenceStore: {
        'inventory.Collector': computed(() => store.getters['reference/collectorItems']),
    },
});
const { queryTags, filters: searchFilters } = queryTagsHelper;

const apiQueryHelper = new ApiQueryHelper();

const getQuery = () => {
    apiQueryHelper.setFilters(searchFilters.value);

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

    return apiQueryHelper.data;
};

/* Components */
const handleSelect = (item) => {
    router.push({
        name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
        params: { jobId: item.job_id },
    }).catch(() => {});
};
const handleChange = async (options: ToolboxOptions = {}) => {
    setApiQueryWithToolboxOptions(apiQueryHelper, options);
    if (options.queryTags) {
        queryTagsHelper.setQueryTags(options.queryTags);
        await replaceUrlQuery('filters', queryTagsHelper.getURLQueryStringFilters());
    }
    if (options?.pageStart !== undefined) state.pageStart = options.pageStart;
    if (options?.pageLimit !== undefined) {
        state.pageSize = options.pageLimit;
        state.thisPage = 1;
        state.pageStart = getPageStart(state.thisPage, state.pageSize);
    }
    await getJobs();
};
const handleChangePagination = () => {
    state.pageStart = getPageStart(state.thisPage, state.pageSize);
    getJobs();
};

/* API */
const getJobs = async () => {
    state.loading = true;
    try {
        const res = await SpaceConnector.client.inventory.job.list({ query: getQuery() });
        state.totalCount = res.total_count;
        state.items = res.results.map((job) => {
            const collector = storeState.collectors[job.collector_id];
            const plugin = storeState.plugins[job.plugin_id];
            return {
                ...job,
                collector_info: {
                    label: collector?.name,
                    plugin_info: {
                        label: plugin?.label,
                        icon: plugin?.icon,
                    },
                },
                progress: job.total_tasks === 0 ? { succeededPercentage: 100, failedPercentage: 0 } : {
                    succeededPercentage: (job.success_tasks / job.total_tasks) * 100,
                    failedPercentage: (job.failure_tasks / job.total_tasks) * 100,
                    isCanceled: job.status === JOB_STATE.CANCELED,
                },
                created_at: iso8601Formatter(job.created_at, storeState.timezone),
                duration: durationFormatter(job.created_at, job.finished_at, storeState.timezone) || '--',
            };
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => state.selectedStatus, (selectedStatus) => {
    state.selectedStatus = selectedStatus;
    state.thisPage = 1;
    state.pageStart = 1;
    getJobs();
});

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/collector/load'),
    ]);

    const currentQuery = router.currentRoute.value.query;
    queryTagsHelper.setURLQueryStringFilters(currentQuery.filters);
    apiQueryHelper.setPage(state.pageStart, state.pageSize)
        .setSort(state.sortBy, true)
        .setFilters(searchFilters.value);

    await getJobs();
    if (state.totalCount === 0) state.modalVisible = true;
})();
</script>

<template>
    <div class="collector-history-page">
        <p-heading :title="t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE')"
                   show-back-button
                   @click-back-button="router.go(-1)"
        />
        <div class="collector-history-table">
            <div class="status-wrapper">
                <span class="label">{{ t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}:</span>
                <p-select-button-group v-model:selected="state.selectedStatus"
                                       class="select-button-group"
                                       :buttons="statusList"
                                       theme="text"
                />
            </div>
            <!-- eslint-disable -->
            <p-toolbox-table search-type="query"
                             :fields="fields"
                             :items="state.items"
                             :query-tags="queryTags"
                             :key-item-sets="handlers.keyItemSets"
                             :value-handler-map="handlers.valueHandlerMap"
                             :loading="state.loading"
                             :total-count="state.totalCount"
                             v-model:this-page="state.thisPage"
                             v-model:page-size="state.pageSize"
                             row-cursor-pointer
                             sortable
                             :sort-by="state.sortBy"
                             :selectable="false"
                             :exportable="false"
                             :class="state.items.length === 0 ? 'no-data' : ''"
                             :style="{height: '100%', border: 'none'}"
                             @change="handleChange"
                             @refresh="handleChange()"
                             @row-left-click="handleSelect"
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
                    <span class="succeeded-text">{{ Math.floor(value.succeededPercentage) }}%</span>
                </template>
            </p-toolbox-table>
            <div v-if="state.items.length > 0"
                 class="pagination"
            >
                <p-pagination :total-count="state.totalCount"
                              v-model:this-page="state.thisPage"
                              v-model:page-size="state.pageSize"
                              @change="handleChangePagination"
                />
            </div>
        </div>
        <no-collector-modal v-model:visible="state.modalVisible"
                            :manage-disabled="!state.hasManagePermission"
                            @confirm="router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME })"
        />
    </div>
</template>

<style lang="postcss" scoped>
.collector-history-page {
    .collector-history-table {
        @apply bg-white border border-gray-200 rounded-lg;
        margin-top: 1rem;
        .status-wrapper {
            display: flex;
            align-items: center;
            margin-left: 1rem;
            margin-top: 1.5rem;
            .label {
                font-size: 0.875rem;
                font-weight: bold;
                line-height: 1.5;
                padding-right: 1rem;
            }

            /* custom design-system component - p-select-button-group */
            :deep(.select-button-group) {
                .button-group {
                    display: flex;
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
