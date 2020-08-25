<template>
    <general-page-layout class="collector-history">
        <div v-if="!selectedItem">
            <p-page-title :title="pageTitle" />
            <p-collector-history-chart :loading="loading" />
            <p-query-search-table
                :fields="fields"
                :items="items"
                :loading="loading"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :this-page.sync="thisPage"
                :page-size.sync="pageSize"
                :total-count="totalCount"
                :style="{height: '100%'}"
                :selectable="false"
                @change="getJobs"
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
            <p-collector-history-job :job="selectedItem" />
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import { capitalize } from 'lodash';
import moment from 'moment';

import { computed, reactive, toRefs } from '@vue/composition-api';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PCollectorHistoryJob from '@/views/management/collector-history/modules/CollectorHistoryJob.vue';
import PCollectorHistoryChart from '@/views/management/collector-history/modules/CollectionHistoryChart.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { JobModel } from '@/lib/fluent-api/inventory/job';
import { timestampFormatter } from '@/lib/util';

export default {
    name: 'PCollectorHistory',
    components: {
        PCollectorHistoryChart,
        PCollectorHistoryJob,
        PQuerySearchTable,
        PPageTitle,
        GeneralPageLayout,
    },
    setup() {
        const state = reactive({
            loading: false,
            pageTitle: computed(() => (state.selectedItem ? state.selectedItem.job_id : 'Collector History')),
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
            //
            selectedIndex: [],
            selectedItem: computed(() => state.jobs[state.selectedIndex]),
        });

        const onSelect = (item, index) => {
            state.selectedIndex = index;
        };
        const onClickGoBack = () => {
            state.selectedIndex = [];
        };
        const onClickStatus = (status) => {
            state.activatedStatus = status;
        };

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

        const getJobs = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper();
                query.setSort(state.sortBy, state.sortDesc).setPage(((state.thisPage - 1) * state.pageSize) + 1, state.pageSize);

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

        const init = async () => {
            await getJobs();
        };
        init();

        return {
            ...toRefs(state),
            onSelect,
            onClickGoBack,
            onClickStatus,
            getJobs,
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
