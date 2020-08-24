<template>
    <general-page-layout class="collector-history">
        <div v-if="!selectedItem">
            <p-page-title :title="pageTitle" />
            <p-collector-history-chart :loading="loading" />
            <p-query-search-table
                :fields="fields"
                :items="jobs"
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
                <template #col-status-format="{ value }">
                    <span :class="value.toLowerCase()">{{ convertStatus(value) }}</span>
                </template>
                <template #col-created_at-format="{ value }">
                    {{ timestampFormatter(value) }}
                </template>
            </p-query-search-table>
        </div>
        <div v-else>
            <p-page-title :title="pageTitle" child @goBack="onClickGoBack" />
            <p-collector-history-job :job="selectedItem" :loading="loading" />
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import { capitalize } from 'lodash';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

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
        const getJobs = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper();
                query.setSort(state.sortBy, state.sortDesc).setPage(((state.thisPage - 1) * state.pageSize) + 1, state.pageSize);

                const res = await SpaceConnector.client.inventory.job.list({ query: query.data });
                state.jobs = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

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
            if (status === 'PENDING' || status === 'IN_PROGRESS') return 'In Progress';
            return capitalize(status);
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
            convertStatus,
            timestampFormatter,
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
        .error, .timeout, .canceled {
            @apply text-red-500;
        }
    }
}
</style>
