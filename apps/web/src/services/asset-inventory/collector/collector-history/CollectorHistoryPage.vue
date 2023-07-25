<template>
    <div class="collector-history-page">
        <p-heading :title="$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <div class="collector-history-table">
            <div class="status-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}:</span>
                <p-select-button-group class="select-button-group"
                                       :buttons="statusList"
                                       :selected.sync="state.selectedStatus"
                                       theme="text"
                />
            </div>
            <p-toolbox-table search-type="query"
                             :fields="fields"
                             :items="state.items"
                             :query-tags="queryTags"
                             :key-item-sets="handlers.keyItemSets"
                             :value-handler-map="handlers.valueHandlerMap"
                             :loading="state.loading"
                             :total-count="state.totalCount"
                             :this-page.sync="state.thisPage"
                             :page-size.sync="state.pageSize"
                             row-cursor-pointer
                             sortable
                             :selectable="false"
                             :exportable="false"
                             :class="state.items.length === 0 ? 'no-data' : ''"
                             :style="{height: '100%', border: 'none'}"
                             @change="handleChange"
                             @refresh="handleChange()"
                             @rowLeftClick="handleSelect"
            >
                <template #th-task-format="{ field }">
                    <span>{{ field.label }}</span>
                    <span class="th-additional-info-text"> (completed / total)</span>
                </template>
                <template #[`col-collector_info.plugin_info-format`]="{ value }">
                    <template v-if="value">
                        <p-lazy-img :src="storeState.plugins[value.plugin_id] ? storeState.plugins[value.plugin_id].icon : ''"
                                    width="1rem"
                                    height="1rem"
                                    class="mr-2"
                        />
                        {{ storeState.plugins[value.plugin_id] ? storeState.plugins[value.plugin_id].label : value.plugin_id }}
                    </template>
                </template>
                <template #col-status-format="{ value }">
                    <!-- TODO: will be check the color and translation after the API is updated -->
                    <p-status
                        :text="statusTextFormatter(value)"
                        :text-color="statusTextColorFormatter(value)"
                        :icon="statusIconFormatter(value)"
                        :icon-color="statusIconColorFormatter(value)"
                        :icon-animation="value === JOB_STATE.IN_PROGRESS ? 'spin' : undefined"
                    />
                </template>
                <!-- TODO: will be check the color and translation after the API is updated -->
                <!--                <template #col-progress="{ value }">-->
                <!--                    <div class="col-progress-format">-->
                <!--                        <span class="succeeded-bar"-->
                <!--                              :style="{ width: `${value.succeededPercentage}%` }"-->
                <!--                        />-->
                <!--                        <span class="failed-bar"-->
                <!--                              :style="{ width: `${value.failedPercentage}%` }"-->
                <!--                        />-->
                <!--                    </div>-->
                <!--                    <span class="text">{{ value }}%</span>-->
                <!--                </template>-->
            </p-toolbox-table>
            <div v-if="state.items.length > 0"
                 class="pagination"
            >
                <p-pagination :total-count="state.totalCount"
                              :this-page.sync="state.thisPage"
                              :page-size.sync="state.pageSize"
                              @change="handleChangePagination"
                />
            </div>
        </div>
        <no-collector-modal :visible.sync="state.modalVisible"
                            :manage-disabled="!state.hasManagePermission"
                            @confirm="$router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME })"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PHeading, PPagination, PLazyImg,
    PSelectButtonGroup, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { iso8601Formatter, durationFormatter } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import {
    makeEnumValueHandler, makeDistinctValueHandler, makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import { useQueryTags } from '@/common/composables/query-tags';

import {
    statusIconColorFormatter,
    statusIconFormatter,
    statusTextColorFormatter,
    statusTextFormatter,
} from '@/services/asset-inventory/collector/collector-history/lib/formatter-helper';
import NoCollectorModal from '@/services/asset-inventory/collector/collector-history/modules/NoCollectorModal.vue';
import { JOB_SELECTED_STATUS } from '@/services/asset-inventory/collector/collector-history/type';
import { JOB_STATE } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const fields: DataTableField[] = [
    { label: 'Job ID', name: 'job_id' },
    { label: 'Collector', name: 'collector_info.name', sortable: false },
    { label: 'Plugin', name: 'collector_info.plugin_info', sortable: false },
    { label: 'Status', name: 'status', sortable: false },
    // TODO: will be check the color and translation after the API is updated
    // { label: 'Job Progress', name: 'progress' },
    { label: 'Created', name: 'created_at' },
    { label: 'Duration', name: 'duration', sortable: false },
];
const statusList = [
    { name: JOB_SELECTED_STATUS.ALL, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.ALL') },
    { name: JOB_SELECTED_STATUS.PROGRESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.IN_PROGRESS') },
    { name: JOB_SELECTED_STATUS.SUCCESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.SUCCESS') },
    { name: JOB_SELECTED_STATUS.FAILURE, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.FAILURE') },
    { name: JOB_SELECTED_STATUS.CANCELED, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.CANCELED') },
];

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
    apiQueryHelper
        .setPage(state.pageStart, state.pageSize)
        .setSort('created_at', true)
        .setFilters(searchFilters.value);

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
    SpaceRouter.router.push({
        name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
        params: { jobId: item.job_id },
    }).catch(() => {});
};
const handleChange = async (options: ToolboxOptions = {}) => {
    setApiQueryWithToolboxOptions(apiQueryHelper, options, { queryTags: true });
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
        state.items = res.results.map((job) => ({
            ...job,
            progress: {
                succeededPercentage: (job.success_tasks / job.total_tasks) * 100,
                failedPercentage: (job.failure_tasks / job.total_tasks) * 100,
            },
            created_at: iso8601Formatter(job.created_at, storeState.timezone),
            duration: durationFormatter(job.created_at, job.finished_at, storeState.timezone) || '--',
        }));
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
}, { immediate: true });

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/collector/load'),
    ]);

    const currentQuery = SpaceRouter.router.currentRoute.query;
    queryTagsHelper.setURLQueryStringFilters(currentQuery.filters);

    await getJobs();
    if (state.totalCount === 0) state.modalVisible = true;
})();
</script>

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
            .text {
                @apply text-gray-700;
            }
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
