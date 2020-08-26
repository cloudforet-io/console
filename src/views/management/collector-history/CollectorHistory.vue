<template>
    <general-page-layout class="collector-history">
        <div v-if="!selectedJobId">
            <p-page-title :title="pageTitle" />
            <!--            <p-collector-history-chart :loading="loading" />-->
            <p-query-search-table
                :fields="fields"
                :items="items"
                :loading="loading"
                :query-tags="searchTags"
                :key-items="querySearchHandlers.keyItems"
                :value-handler-map="querySearchHandlers.valueHandlerMap"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :this-page.sync="thisPage"
                :page-size.sync="pageSize"
                :total-count="totalCount"
                :style="{height: '100%'}"
                :selectable="false"
                :row-cursor-pointer="rowCursorPointer"
                @change="onChange"
                @rowLeftClick="onSelect"
            >
                <template #toolbox-top>
                    <div class="toolbox-filter-button-lap">
                        <div v-for="(status, idx) in statusList"
                             :key="idx"
                             class="filter-button-lap"
                        >
                            <span class="filter-button"
                                  :class="[activatedStatus === status.key ? 'active' : '', status.class]"
                                  @click="onClickStatus(status.key)"
                            >{{ status.label }}</span>
                        </div>
                    </div>
                </template>
                <template #th-total_tasks-format="{ value }">
                    <span>{{ value }}</span>
                    <span class="th-additional-info-text">(completed / total)</span>
                </template>
                <template #col-status-format="{ value }">
                    <span :class="value.toLowerCase()">{{ value }}</span>
                </template>
            </p-query-search-table>
        </div>
        <div v-else>
            <p-page-title :title="pageTitle" child @goBack="onClickGoBack" />
            <p-collector-history-job :job-id="selectedJobId" />
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import { capitalize } from 'lodash';
import moment from 'moment';

import {
    computed, getCurrentInstance, reactive, toRefs, ComponentRenderProxy,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PCollectorHistoryJob from '@/views/management/collector-history/modules/CollectorHistoryJob.vue';
// import PCollectorHistoryChart from '@/views/management/collector-history/modules/CollectionHistoryChart.vue';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { JobModel } from '@/lib/fluent-api/inventory/job';
import { timestampFormatter } from '@/lib/util';
import { getFiltersFromQueryTags, parseTag } from '@/lib/api/query-search';
import { makeQuerySearchHandlersWithSearchSchema } from '@/lib/component-utils/query-search';
import router from '@/routes';

enum JOB_STATUS {
    created = 'CREATED',
    canceled = 'CANCELED',
    progress = 'IN_PROGRESS',
    success = 'SUCCESS',
    error = 'ERROR',
    timeout = 'TIMEOUT',
}
type UrlQueryString = string | (string | null)[] | null | undefined;

export default {
    name: 'PCollectorHistory',
    components: {
        // PCollectorHistoryChart,
        PCollectorHistoryJob,
        PQuerySearchTable,
        PPageTitle,
        GeneralPageLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            pageTitle: computed(() => (state.selectedJobId ? state.selectedJobId : 'Collector History')),
            fields: computed(() => [
                { label: 'No.', name: 'sequence' },
                { label: 'Job ID', name: 'job_id' },
                { label: 'Collector Name', name: 'collector_info.name' },
                { label: 'Status', name: 'status' },
                { label: 'Task', name: 'total_tasks' },
                { label: 'Start Time', name: 'created_at' },
                { label: 'Duration', name: 'duration' },
            ]),
            statusList: [
                { key: 'all', label: 'All', class: 'all' },
                { key: 'inProgress', label: 'In-progress', class: 'in-progress' },
                { key: 'success', label: 'Success', class: 'success' },
                { key: 'failure', label: 'Failure', class: 'failure' },
            ],
            activatedStatus: 'all',
            jobs: [] as JobModel[],
            items: [],
            //
            pageSize: 15,
            thisPage: 1,
            sortBy: '',
            sortDesc: true,
            totalCount: 0,
            rowCursorPointer: true,
            //
            selectedJobId: '',
            searchTags: [],
            querySearchHandlers: makeQuerySearchHandlersWithSearchSchema({
                title: 'Properties',
                items: [
                    // { key: 'job_id', name: 'Job ID' },
                    // { key: 'collector_name', name: 'Collector Name' },
                    { key: 'status', name: 'Status', enums: Object.values(JOB_STATUS) },
                ],
            }, 'inventory.CollectorHistory'),
        });

        const convertStatus = (status) => {
            if (status === 'PENDING' || status === 'IN_PROGRESS') return 'In-progress';
            return capitalize(status);
        };
        const convertFinishedAtToDuration = (createdAt, finishedAt) => {
            if (createdAt && finishedAt) {
                const createdAtMoment = moment(timestampFormatter(createdAt));
                const finishedAtMoment = moment(timestampFormatter(finishedAt));
                const duration = finishedAtMoment.diff(createdAtMoment, 'minutes');
                return `${duration.toString()} min`;
            }
            return null;
        };
        const convertJobsToFieldItem = (jobs) => {
            state.items = [];
            jobs.forEach((job, index) => {
                const newJob = {
                    sequence: (index + 1) + ((state.thisPage - 1) * state.pageSize),
                    // eslint-disable-next-line camelcase
                    job_id: job.job_id,
                    'collector_info.name': job.collector_info.name,
                    status: convertStatus(job.status),
                    // eslint-disable-next-line camelcase
                    total_tasks: `${job.total_tasks - job.remained_tasks} / ${job.total_tasks}`,
                    // eslint-disable-next-line camelcase
                    created_at: timestampFormatter(job.created_at),
                    duration: convertFinishedAtToDuration(job.created_at, job.finished_at),
                };
                state.items.push(newJob);
            });
        };

        const getQuery = () => {
            let statusValues: JOB_STATUS[] = [];
            if (state.activatedStatus === 'inProgress') {
                statusValues = [JOB_STATUS.progress];
            } else if (state.activatedStatus === 'success') {
                statusValues = [JOB_STATUS.created, JOB_STATUS.success];
            } else if (state.activatedStatus === 'failure') {
                statusValues = [JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout];
            }

            const { and, or } = getFiltersFromQueryTags(state.searchTags);

            const query = new QueryHelper();
            query
                .setSort(state.sortBy, state.sortDesc)
                .setPage(((state.thisPage - 1) * state.pageSize) + 1, state.pageSize)
                .setKeyword(...or);
            if (statusValues.length > 0) {
                query.setFilter({
                    k: 'status',
                    v: statusValues,
                    o: 'in',
                }, ...and);
            } else {
                query.setFilter(...and);
            }

            return query;
        };
        const getJobs = async () => {
            state.loading = true;
            try {
                const query = getQuery();
                const res = await SpaceConnector.client.inventory.job.list({ query: query.data });
                state.jobs = res.results;
                state.totalCount = res.total_count;

                convertJobsToFieldItem(res.results);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const searchTagsToUrlQueryString = (tags: QueryTag[]): UrlQueryString => {
            if (Array.isArray(tags)) {
                return tags.map((tag) => {
                    let item;
                    if (tag.key) item = `${tag.key.name}:${tag.operator}${tag.value?.name}`;
                    else item = `${tag.value?.name}`;
                    return item;
                });
            }
            return null;
        };
        const urlQueryStringToSearchTags = (urlQueryString: UrlQueryString): QueryTag[] => {
            if (!urlQueryString) return [];
            if (Array.isArray(urlQueryString)) {
                return urlQueryString.reduce((res, qs) => {
                    if (qs) res.push(parseTag(qs));
                    return res;
                }, [] as QueryTag[]);
            }
            return [parseTag(urlQueryString as string)];
        };

        const onSelect = (item) => {
            state.selectedJobId = item.job_id;
            // eslint-disable-next-line no-empty-function
            vm.$router.replace({ query: { ...router.currentRoute.query }, hash: item.job_id }).catch(() => {});
        };
        const onChange = async (item) => {
            state.searchTags = item.queryTags;
            const urlQueryString = searchTagsToUrlQueryString(item.queryTags);
            // eslint-disable-next-line no-empty-function
            await vm.$router.replace({ query: { ...router.currentRoute.query, f: urlQueryString } }).catch(() => {});
            try {
                await getJobs();
            } catch (e) {
                console.error(e);
            }
        };
        const onClickGoBack = () => {
            state.selectedJobId = '';
            // eslint-disable-next-line no-empty-function
            vm.$router.replace({ query: { ...router.currentRoute.query }, hash: '' }).catch(() => {});
        };
        const onClickStatus = (status) => {
            state.activatedStatus = status;
            getJobs();
        };

        const init = async () => {
            const hash = router.currentRoute.hash;
            if (hash) {
                state.selectedJobId = hash.replace('#', '');
            }
            state.searchTags = urlQueryStringToSearchTags(vm.$route.query.f);
            await getJobs();
        };
        init();

        return {
            ...toRefs(state),
            onSelect,
            onChange,
            onClickGoBack,
            onClickStatus,
        };
    },
};
</script>

<style lang="postcss">
.collector-history {
    .toolbox {
        .filter-button-lap {
            @apply border-r border-gray-200;
            display: inline-block;
            padding: 0 1rem;
            &:first-child {
                padding-left: 0;
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
                &:before {
                }
            }
            &.failure:hover, &.failure:focus, &.failure.active {
                @apply text-red-500;
            }
        }
    }

    .p-query-search-table {
        .p-data-table {
            .error, .timeout, .canceled {
                @apply text-red-500;
            }
            .th-additional-info-text {
                font-weight: normal;
                font-size: 0.75rem;
            }
        }
    }
}
</style>
