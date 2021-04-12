<template>
    <general-page-layout class="collector-history-container">
        <div v-if="!selectedJobId">
            <p-breadcrumbs :routes="route" />
            <p-page-title :title="pageTitle" />
            <p-pane-layout class="collector-history-wrapper">
                <p-collector-history-chart class="history-chart"
                                           @click-date="onClickDate"
                />
                <p-query-search-table
                    ref="querySearchRef"
                    :class="items.length === 0 ? 'no-data' : ''"
                    :fields="fields"
                    :items="items"
                    :query-tags="tags"
                    :key-item-sets="handlers.keyItemSets"
                    :value-handler-map="handlers.valueHandlerMap"
                    :loading="loading"
                    :total-count="totalCount"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    :style="{height: '100%', border: 'none'}"
                    :selectable="false"
                    :row-cursor-pointer="rowCursorPointer"
                    :excel-visible="false"
                    @change="onChange"
                    @rowLeftClick="onSelect"
                >
                    <template #toolbox-top>
                        <div class="flex ml-4">
                            <div v-for="(status, idx) in statusList"
                                 :key="idx"
                                 class="filter-button-wrapper"
                            >
                                <span v-if="status.icon" class="legend-icon" :class="status.class" />
                                <span class="filter-button"
                                      :class="[activatedStatus === status.key ? 'active' : '', status.class]"
                                      @click="onClickStatus(status.key)"
                                >{{ status.label }}</span>
                            </div>
                        </div>
                    </template>
                    <template #th-task-format="{  field }">
                        <span>{{ field.label }}</span>
                        <span class="th-additional-info-text"> (completed / total)</span>
                    </template>
                    <template #col-collector_info-format="{ value }">
                        <router-link :to="referenceRouter(
                            value.collector_id,
                            { resource_type: 'inventory.Collector' })"
                        >
                            <span class="reference-link">
                                <span class="text">{{ value.name }}</span>
                                <p-i name="ic_external-link" height="1em" width="1em" />
                            </span>
                        </router-link>
                    </template>
                    <template #col-collector_info.plugin_info-format="{ value }">
                        <p-lazy-img
                            :src="plugins[value.plugin_id].icon"
                            width="1rem" height="1rem"
                        />
                        <span class="pl-2">{{ plugins[value.plugin_id].name }}</span>
                    </template>
                    <template #col-sequence-format="{ value }">
                        <span class="float-right">{{ value }}</span>
                    </template>
                    <template #col-status-format="{ value }">
                        <p-lottie v-if="value === 'IN_PROGRESS'"
                                  class="status-icon"
                                  :size="1" :auto="true" name="lottie_working"
                        />
                        <p-lottie v-else-if="['CANCELED', 'ERROR', 'TIMEOUT'].includes(value)"
                                  class="status-icon"
                                  :size="1" :auto="true" name="lottie_error"
                        />
                        <p-i v-else name="ic_done"
                             width="1rem" height="1rem"
                        />
                        <span :class="value.toLowerCase()" class="pl-2">{{ statusFormatter(value) }}</span>
                    </template>
                    <template #col-created_at-format="{value}">
                        {{ iso8601Formatter(value, timezone) }}
                    </template>
                </p-query-search-table>
                <div v-if="!loading && items.length > 0" class="pagination">
                    <p-pagination :total-count="totalCount"
                                  :this-page.sync="thisPage"
                                  :page-size.sync="pageSize"
                                  @change="onPaginationChange"
                    />
                </div>
            </p-pane-layout>
            <p-button-modal
                class="button-modal"
                :header-title="$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_TITLE')"
                :scrollable="false"
                size="md"
                :fade="true"
                :backdrop="true"
                :visible.sync="modalVisible"
            >
                <template #body>
                    <p class="modal-content">
                        <b>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_DESC_1') }}</b><br>
                        {{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_DESC_2') }}
                    </p>
                </template>
                <template #confirm-button>
                    <p-icon-text-button
                        class="create-collector-button"
                        style-type="primary-dark"
                        name="ic_plus_bold"
                        @click="$router.push({ name: 'createCollector' })"
                    >
                        {{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_CREATE_COLLECTOR') }}
                    </p-icon-text-button>
                </template>
            </p-button-modal>
        </div>
        <div v-else>
            <p-breadcrumbs v-if="selectedJobId" :routes="subRoute" />
            <p-page-title :title="pageTitle" child @goBack="onClickGoBack" />
            <collector-history-job :job-id="selectedJobId" />
        </div>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { capitalize } from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import {
    computed, getCurrentInstance, reactive, toRefs, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import {
    PPageTitle, PQuerySearchTable, PPagination, PButtonModal, PLazyImg,
    PBreadcrumbs, PPaneLayout, PIconTextButton, PLottie, PI,
} from '@spaceone/design-system';
import { QuerySearchTableFunctions } from '@spaceone/design-system/dist/src/data-display/tables/query-search-table/type';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import CollectorHistoryJob from '@/views/management/collector-history/modules/CollectorHistoryJob.vue';
import PCollectorHistoryChart from '@/views/management/collector-history/modules/CollectorHistoryChart.vue';
import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { iso8601Formatter } from '@/lib/util';
import { replaceUrlQuery } from '@/lib/router-query-string';
import {
    makeEnumValueHandler, makeDistinctValueHandler, makeReferenceValueHandler,
} from '@/lib/component-utils/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';
import { TimeStamp } from '@/models';
import { store } from '@/store';
import router from '@/routes';
import { QueryHelper } from '@/lib/query';

dayjs.extend(utc);
dayjs.extend(timezone);

enum JOB_STATUS {
    created = 'CREATED',
    canceled = 'CANCELED',
    progress = 'IN_PROGRESS',
    success = 'SUCCESS',
    error = 'ERROR',
    timeout = 'TIMEOUT',
}

interface JobModel {
    job_id: string;
    state: JOB_STATUS;
    collect_mode: COLLECT_MODE;
    collector_info: CollectorModel;
    secret_id: string;
    filter: any;
    errors: {
        code: string;
        message: string;
        secret_id?: string;
    }[];
    created_at: TimeStamp;
    finished_at: TimeStamp;
}

export default {
    name: 'PCollectorHistory',
    components: {
        PI,
        PLottie,
        PLazyImg,
        PIconTextButton,
        PButtonModal,
        PPaneLayout,
        PBreadcrumbs,
        PCollectorHistoryChart,
        PPagination,
        CollectorHistoryJob,
        PQuerySearchTable,
        PPageTitle,
        GeneralPageLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const handlers = {
            keyItemSets: [{
                title: 'Filters',
                items: [
                    {
                        name: 'job_id',
                        label: 'Job ID',
                    },
                    {
                        name: 'status',
                        label: 'Status',
                    },
                    {
                        name: 'collector_id',
                        label: 'Collector',
                    },
                    {
                        dataType: 'datetime',
                        name: 'created_at',
                        label: 'Start Time',
                    },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: {
                job_id: makeDistinctValueHandler('inventory.Job', 'job_id'),
                status: makeEnumValueHandler(JOB_STATUS),
                collector_id: makeReferenceValueHandler('inventory.Collector'),
            },
        };
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            loading: false,
            plugins: computed(() => store.state.resource.plugin.items),
            isDomainOwner: computed(() => store.state.user.userType === 'DOMAIN_OWNER'),
            pageTitle: computed(() => (state.selectedJobId ? state.selectedJobId : vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE'))),
            fields: computed(() => [
                { label: 'Job ID', name: 'job_id' },
                { label: 'Collector', name: 'collector_info', sortable: false },
                { label: 'Plugin', name: 'collector_info.plugin_info', sortable: false },
                { label: 'Status', name: 'status' },
                { label: 'Task', name: 'task' },
                { label: 'Start Time', name: 'created_at' },
                { label: 'Duration', name: 'duration', sortable: false },
            ]),
            statusList: computed(() => ([
                {
                    key: 'all', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.ALL'), class: 'all',
                },
                {
                    key: 'inProgress', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.IN_PROGRESS'), class: 'in-progress',
                },
                {
                    key: 'success', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.SUCCESS'), class: 'success', icon: true,
                },
                {
                    key: 'failure', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.FAILURE'), class: 'failure', icon: true,
                },
            ])),
            activatedStatus: 'all',
            jobs: [] as JobModel[],
            items: [],
            //
            pageStart: 1,
            pageSize: 15,
            thisPage: 1,
            sortBy: 'created_at',
            sortDesc: true,
            totalCount: 0,
            rowCursorPointer: true,
            //
            selectedJobId: '',
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            querySearchRef: null as null|QuerySearchTableFunctions,
            modalVisible: false,
        });
        const routeState = reactive({
            route: computed(() => ([
                { name: vm.$t('MENU.MANAGEMENT.MANAGEMENT'), path: '/management/collector-history' },
                { name: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY') },
            ])),
        });
        const subRouteState = reactive({
            subRoute: computed(() => [
                { name: vm.$t('MENU.MANAGEMENT.MANAGEMENT'), path: '/management/collector-history' },
                { name: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY'), path: '/management/collector-history' },
                { name: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY_JOB_MANAGEMENT') },
            ]),
        });

        const statusFormatter = (status) => {
            if (status === 'PENDING' || status === 'IN_PROGRESS') return 'In-Progress';
            return capitalize(status);
        };
        const durationFormatter = (createdAt, finishedAt) => {
            if (createdAt && finishedAt) {
                const createdAtMoment = dayjs(iso8601Formatter(createdAt, state.timezone));
                const finishedAtMoment = dayjs(iso8601Formatter(finishedAt, state.timezone));
                let duration = finishedAtMoment.diff(createdAtMoment, 'second');
                if (duration < 60) return `${duration} sec`;
                duration = finishedAtMoment.diff(createdAtMoment, 'minute');
                return `${duration} min`;
            }
            return null;
        };
        const convertJobsToFieldItem = (jobs) => {
            state.items = [];
            jobs.forEach((job, index) => {
                const newJob = {
                    sequence: state.pageStart + index,
                    task: `${job.total_tasks - job.remained_tasks} / ${job.total_tasks}`,
                    duration: durationFormatter(job.created_at, job.finished_at),
                    ...job,
                };
                state.items.push(newJob);
            });
        };

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(state.pageStart, state.pageSize)
                .setFilters(queryHelper.filters);

            let statusValues: JOB_STATUS[] = [];
            if (state.activatedStatus === 'inProgress') {
                statusValues = [JOB_STATUS.progress];
            } else if (state.activatedStatus === 'success') {
                statusValues = [JOB_STATUS.created, JOB_STATUS.success];
            } else if (state.activatedStatus === 'failure') {
                statusValues = [JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout];
            }

            if (statusValues.length > 0) {
                apiQuery.addFilter({ k: 'status', v: statusValues, o: '=' });
            }

            return apiQuery.data;
        };
        const getJobs = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.job.list({ query: getQuery() });
                state.jobs = res.results;
                state.totalCount = res.total_count;
                convertJobsToFieldItem(res.results);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onSelect = (item) => {
            state.selectedJobId = item.job_id;
            // eslint-disable-next-line no-empty-function
            vm.$router.push({ path: router.currentRoute.fullPath, query: { ...router.currentRoute.query }, hash: item.job_id }).catch(() => {});
        };
        const onChange = async (item) => {
            if (item.sortBy !== undefined) {
                state.sortBy = item.sortBy;
                state.sortDesc = item.sortDesc;
            }
            if (item.pageStart !== undefined) state.pageStart = item.pageStart;
            if (item.pageLimit !== undefined) state.pageSize = item.pageLimit;
            if (item.queryTags !== undefined) {
                state.tags = item.queryTags;
                queryHelper.setFiltersAsQueryTag(item.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }
            try {
                await getJobs();
            } catch (e) {
                console.error(e);
            }
        };
        const onPaginationChange = () => {
            vm.$nextTick(() => {
                state.pageStart = getPageStart(state.thisPage, state.pageSize);
                getJobs();
            });
        };
        const onClickGoBack = () => {
            state.selectedJobId = '';
            // eslint-disable-next-line no-empty-function
            vm.$router.replace({ query: { ...router.currentRoute.query }, hash: '' }).catch(() => {});
        };
        const onClickStatus = (status) => {
            state.activatedStatus = status;
            state.thisPage = 1;
            state.pageStart = 1;
            getJobs();
        };
        const onClickDate = (date) => {
            const selectedDate = dayjs(date).format('YYYY-MM-DD');
            state.querySearchRef.addTag(
                {
                    key: { label: 'Start Time', name: 'created_at', dataType: 'datetime' },
                    value: { label: selectedDate, name: selectedDate },
                    operator: '=',
                },
            );
        };

        const init = async () => {
            // get plugins
            await store.dispatch('resource/plugin/load');

            const hash = router.currentRoute.hash;
            if (hash) {
                state.selectedJobId = hash.replace('#', '');
            }

            await getJobs();
            if (state.totalCount === 0) state.modalVisible = true;
        };
        init();

        watch(() => vm.$route.hash, (after) => {
            if (after === '') onClickGoBack();
        });

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            ...toRefs(subRouteState),
            handlers,
            onSelect,
            onChange,
            onPaginationChange,
            onClickGoBack,
            onClickStatus,
            onClickDate,
            statusFormatter,
            iso8601Formatter,
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collector-history-container {
    .filter-button-wrapper {
        @apply border-r border-gray-200;
        display: inline-block;
        padding: 0 1rem;
        &:first-child {
            padding-left: 0;
        }
        &:last-child {
            @apply border-none;
        }
        .legend-icon {
            display: inline-block;
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 2px;
            margin-right: 7px;
            &.success {
                @apply bg-primary;
            }
            &.failure {
                @apply bg-red-500;
            }
        }
        .filter-button {
            @apply text-gray-400;
            font-size: 0.875rem;
            cursor: pointer;
            &:hover, &:focus {
                @apply text-gray-900;
            }
            &.active {
                @apply text-gray-900;
                font-weight: bold;
            }
            &.failure:hover, &.failure:focus, &.failure.active {
                @apply text-red-500;
            }
        }
    }

    .history-chart {
        margin-left: 3rem;
        margin-right: 3rem;
        margin-top: 2.5rem;
    }

    .p-query-search-table {
        margin-top: 2rem;
        &.no-data {
            .p-data-table {
                min-height: 18.75rem;
            }
        }
        .p-data-table {
            .error, .timeout, .canceled {
                @apply text-red-500;
            }
            .th-additional-info-text {
                font-weight: normal;
                font-size: 0.75rem;
                vertical-align: initial;
            }
            .status-icon {
                display: inline-flex;
            }
            .reference-link {
                &:hover {
                    text-decoration: underline;
                }
                .text {
                    margin-right: 0.125rem;
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

    .button-modal {
        .modal-content {
            line-height: 1.5rem;
        }
        .modal-btn {
            .create-collector-button {
                padding: 0;
            }
        }
    }
}
</style>
