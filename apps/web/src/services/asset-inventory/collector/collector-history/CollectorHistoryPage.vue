<script lang="ts" setup>
import { iso8601Formatter, durationFormatter, numberFormatter } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import {
    makeEnumValueHandler, makeDistinctValueHandler, makeReferenceValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PPagination, PLazyImg,
    PSelectButtonGroup, PProgressBar, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import { capitalize } from 'lodash';
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

import { peacock, green, red } from '@/styles/colors';

import { JOB_STATUS } from '@/services/asset-inventory/collector/collector-history/lib/config';
import PCollectorHistoryChart from '@/services/asset-inventory/collector/collector-history/modules/CollectorHistoryChart.vue';
import NoCollectorModal from '@/services/asset-inventory/collector/collector-history/modules/NoCollectorModal.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';


const PROGRESS_BAR_COLOR = peacock[500];
const COMPLETED_ICON_COLOR = green[500];
const FAILED_ICON_COLOR = red[400];

const statusTextFormatter = (status) => {
    if (status === JOB_STATUS.success) return 'Completed';
    if (status === JOB_STATUS.progress || status === JOB_STATUS.created) return 'In-Progress';
    return capitalize(status);
};
const statusTextColorFormatter = (status) => {
    if ([JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout].includes(status)) return FAILED_ICON_COLOR;
    return undefined;
};
const statusIconFormatter = (status) => {
    if (status === JOB_STATUS.success) return 'ic_check';
    if (status === JOB_STATUS.progress || status === JOB_STATUS.created) return 'ic_gear-filled';
    return 'ic_error-filled';
};
const statusIconColorFormatter = (status) => {
    if (status === JOB_STATUS.success) return COMPLETED_ICON_COLOR;
    if (status === JOB_STATUS.progress || status === JOB_STATUS.created) return undefined;
    return FAILED_ICON_COLOR;
};

const store = useStore();
const { t } = useI18n();
const router = useRouter();

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
    collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});
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
        status: makeEnumValueHandler(JOB_STATUS),
        collector_id: makeReferenceValueHandler('inventory.Collector'),
    } as ValueHandlerMap,
});

const queryTagsHelper = useQueryTags({
    keyItemSets: handlers.keyItemSets,
    referenceStore: {
        'inventory.Collector': computed(() => store.getters['reference/collectorItems']),
    },
});
const { queryTags, filters: searchFilters } = queryTagsHelper;
const state = reactive({
    hasManagePermission: useManagePermissionState(),
    loading: true,
    modalVisible: false,
    isDomainOwner: computed(() => store.state.user.userType === 'DOMAIN_OWNER'),
    fields: computed(() => [
        { label: 'Job ID', name: 'job_id' },
        { label: 'Collector', name: 'collector_info.name', sortable: false },
        { label: 'Plugin', name: 'collector_info.plugin_info', sortable: false },
        { label: 'Status', name: 'status', sortable: false },
        { label: 'Job Progress', name: 'remained_tasks' },
        { label: 'Created', name: 'created_at' },
        { label: 'Duration', name: 'duration', sortable: false },
    ]),
    statusList: computed(() => ([
        {
            name: 'all', label: t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.ALL'),
        },
        {
            name: 'inProgress', label: t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.IN_PROGRESS'),
        },
        {
            name: 'completed', label: t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.COMPLETED'),
        },
        {
            name: 'failed', label: t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.FAILED'),
        },
    ])),
    selectedStatus: 'all',
    items: [] as any[],
    //
    pageStart: 1,
    pageSize: 15,
    thisPage: 1,
    totalCount: 0,
});

/* api */
const apiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true);
const getQuery = () => {
    apiQueryHelper
        .setPageStart(state.pageStart).setPageLimit(state.pageSize)
        .setFilters(searchFilters.value);

    let statusValues: JOB_STATUS[] = [];
    if (state.selectedStatus === 'inProgress') {
        statusValues = [JOB_STATUS.progress];
    } else if (state.selectedStatus === 'completed') {
        statusValues = [JOB_STATUS.created, JOB_STATUS.success];
    } else if (state.selectedStatus === 'failed') {
        statusValues = [JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout];
    }

    if (statusValues.length > 0) {
        apiQueryHelper.addFilter({ k: 'status', v: statusValues, o: '=' });
    }

    return apiQueryHelper.data;
};
const getJobs = async () => {
    state.loading = true;
    try {
        const res = await SpaceConnector.client.inventory.job.list({ query: getQuery() });
        state.totalCount = res.total_count;
        state.items = res.results.map((job) => ({
            ...job,
            remained_tasks: job.total_tasks > 0 ? numberFormatter(((job.total_tasks - job.remained_tasks) / job.total_tasks) * 100) : 100,
            created_at: iso8601Formatter(job.created_at, storeState.timezone),
            duration: durationFormatter(job.created_at, job.finished_at, storeState.timezone) || '--',
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* event */
const onSelect = (item) => {
    router.push({
        name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
        params: { jobId: item.job_id },
    }).catch(() => {});
};
const handleChange = async (options: ToolboxOptions = {}) => {
    setApiQueryWithToolboxOptions(apiQueryHelper, options, { queryTags: true });
    if (options.queryTags) {
        queryTagsHelper.setQueryTags(options.queryTags);
        replaceUrlQuery('filters', queryTagsHelper.getURLQueryStringFilters());
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
const handleClickDate = async (data) => {
    state.selectedStatus = data.type;
    queryTagsHelper.setFilters([
        ...searchFilters.value,
        { k: 'created_at', v: data.date, o: '=' },
    ]);
};

(async () => {
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/collector/load'),
    ]);

    const currentQuery = router.currentRoute.value.query;
    // TODO: need to implement about type assertion
    queryTagsHelper.setURLQueryStringFilters(currentQuery.filters as undefined|string|(string|null)[]);

    await getJobs();
    if (state.totalCount === 0) state.modalVisible = true;
})();

watch(() => state.selectedStatus, (selectedStatus) => {
    state.selectedStatus = selectedStatus;
    state.thisPage = 1;
    state.pageStart = 1;
    getJobs();
});

</script>

<template>
    <div class="collector-history-page">
        <p-heading :title="t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE')"
                   show-back-button
                   @click-back-button="router.go(-1)"
        />
        <p-collector-history-chart @click-date="handleClickDate" />
        <div class="collector-history-table">
            <div class="status-wrapper">
                <span class="label">{{ t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}:</span>
                <p-select-button-group v-model:selected="state.selectedStatus"
                                       class="select-button-group"
                                       :buttons="state.statusList"
                                       theme="text"
                />
            </div>
            <p-toolbox-table v-model:this-page="state.thisPage"
                             v-model:page-size="state.pageSize"
                             search-type="query"
                             :fields="state.fields"
                             :items="state.items"
                             :query-tags="queryTags"
                             :key-item-sets="handlers.keyItemSets"
                             :value-handler-map="handlers.valueHandlerMap"
                             :loading="state.loading"
                             :total-count="state.totalCount"
                             row-cursor-pointer
                             sortable
                             :selectable="false"
                             :exportable="false"
                             :class="state.items.length === 0 ? 'no-data' : ''"
                             :style="{height: '100%', border: 'none'}"
                             @change="handleChange"
                             @refresh="handleChange()"
                             @row-left-click="onSelect"
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
                    <p-status :text="statusTextFormatter(value)"
                              :text-color="statusTextColorFormatter(value)"
                              :icon="statusIconFormatter(value)"
                              :icon-color="statusIconColorFormatter(value)"
                              :icon-animation="[JOB_STATUS.progress, JOB_STATUS.created].includes(value) ? 'spin' : undefined"
                    />
                </template>
                <template #col-remained_tasks-format="{value}">
                    <div class="col-remainedTasks-format">
                        <p-progress-bar
                            :percentage="value"
                            :color="PROGRESS_BAR_COLOR"
                        />
                        <span class="text">{{ value }}%</span>
                    </div>
                </template>
            </p-toolbox-table>
            <div v-if="state.items.length > 0"
                 class="pagination"
            >
                <p-pagination v-model:this-page="state.thisPage"
                              v-model:page-size="state.pageSize"
                              :total-count="state.totalCount"
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
            .p-data-table {
                .col-remainedTasks-format {
                    display: flex;
                    align-items: center;
                    .progress-bar {
                        width: 6.25rem;
                        margin-right: 0.125rem;
                    }
                    .text {
                        @apply text-gray-700;
                    }
                }
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
