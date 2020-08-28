<template>
    <general-page-layout class="collector-history-container">
        <div v-if="!selectedJobId">
            <p-page-navigation :routes="route" />
            <p-page-title :title="pageTitle" />
            <p-pane-layout class="collector-history-wrapper">
                <p-collector-history-chart :loading="loading" class="history-chart" />
                <p-query-search-table
                    :class="items.length === 0 ? 'no-data' : ''"
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
                    :style="{height: '100%', border: 'none'}"
                    :selectable="false"
                    :row-cursor-pointer="rowCursorPointer"
                    :excel-visible="false"
                    @change="onChange"
                    @rowLeftClick="onSelect"
                >
                    <template #toolbox-top>
                        <div class="toolbox-filter-button-lap">
                            <div v-for="(status, idx) in statusList"
                                 :key="idx"
                                 class="filter-button-lap"
                            >
                                <span v-if="status.icon" class="legend-icon" :class="status.class" />
                                <span class="filter-button"
                                      :class="[activatedStatus === status.key ? 'active' : '', status.class]"
                                      @click="onClickStatus(status.key)"
                                >{{ status.label }}</span>
                            </div>
                        </div>
                    </template>
                    <template #th-total_tasks-format="{ value }">
                        <span>{{ value }}</span>
                        <span class="th-additional-info-text"> (completed / total)</span>
                    </template>
                    <template #col-sequence-format="{ value }">
                        <span class="float-right">{{ value }}</span>
                    </template>
                    <template #col-status-format="{ value }">
                        <span :class="value.toLowerCase()">{{ value }}</span>
                    </template>
                </p-query-search-table>
                <div v-if="!loading && items.length > 0" class="pagination">
                    <p-pagination :total-count="totalCount"
                                  :this-page.sync="thisPage"
                                  :page-size.sync="pageSize"
                                  @prevPage="onClickPrevPageButton"
                                  @nextPage="onClickNextPageButton"
                                  @clickPage="onClickPageNumber"
                    />
                </div>
            </p-pane-layout>
            <p-button-modal
                class="button-modal"
                :header-title="modalHeaderTitle"
                :centered="true"
                :scrollable="false"
                size="md"
                :fade="true"
                :backdrop="true"
                :visible.sync="modalVisible"
            >
                <template #body>
                    <p class="modal-content" v-html="modalContent" />
                </template>
                <template #confirm-button>
                    <p-icon-text-button
                        class="create-collector-button"
                        style-type="primary-dark"
                        name="ic_plus_bold"
                        @click="$router.push({path: '/plugin/collector/create/plugins'})"
                    >
                        {{ $t('INVENTORY.CRT_COLL') }}
                    </p-icon-text-button>
                </template>
            </p-button-modal>
        </div>
        <div v-else>
            <p-page-navigation v-if="selectedJobId" :routes="subRoute" />
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
import PCollectorHistoryChart from '@/views/management/collector-history/modules/CollectionHistoryChart.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PPagination from '@/components/organisms/pagination/PPagination.vue';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { JobModel } from '@/lib/fluent-api/inventory/job';
import { timestampFormatter } from '@/lib/util';
import { getFiltersFromQueryTags, parseTag } from '@/lib/api/query-search';
import {
    makeValueHandlerWithReference, makeValueHandlerWithSearchEnums,
} from '@/lib/component-utils/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';
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
        PIconTextButton,
        PButtonModal,
        PPaneLayout,
        PPageNavigation,
        PCollectorHistoryChart,
        PPagination,
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
                {
                    key: 'success', label: 'Success', class: 'success', icon: true,
                },
                {
                    key: 'failure', label: 'Failure', class: 'failure', icon: true,
                },
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
            querySearchHandlers: {
                keyItems: [
                    {
                        name: 'job_id',
                        label: 'Job ID',
                    },
                    {
                        name: 'status',
                        label: 'Status',
                    },
                ],
                valueHandlerMap: {
                    // eslint-disable-next-line camelcase
                    job_id: makeValueHandlerWithReference('inventory.Job', 'job_id'),
                    status: makeValueHandlerWithSearchEnums(JOB_STATUS),
                },
            },
            //
            modalHeaderTitle: 'Need to Set a Collector',
            modalVisible: false,
            modalContent: '<b>Looks like you don\'t have any collector.</b><br/>Set a collector first and then use Collector History.',
        });
        const routeState = reactive({
            route: [{ name: 'Management', path: '/management' }, { name: 'Collector History', path: '/management/collector-history' }],
        });
        const subRouteState = reactive({
            subRoute: [{ name: 'Management', path: '/management' }, { name: 'Collector History', path: '/management/collector-history' },
                { name: 'Job Management', path: `/management/collector-history#${state.selectedJobId}` }],
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
                    sequence: getPageStart(state.thisPage, state.pageSize) + index,
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
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
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

            return query.data;
        };
        const getJobs = async () => {
            state.loading = true;
            try {
                const query = getQuery();
                const res = await SpaceConnector.client.inventory.job.list({ query });
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
        const onClickPageNumber = async (page) => {
            state.thisPage = page;
            await getJobs();
        };
        const onClickPrevPageButton = async (page) => {
            state.thisPage = page - 1;
            if (state.thisPage <= 0) state.thisPage = 1;
            await getJobs();
        };
        const onClickNextPageButton = async (page) => {
            state.thisPage = page + 1;
            await getJobs();
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
            if (state.totalCount === 0) state.modalVisible = true;
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            ...toRefs(subRouteState),
            onSelect,
            onChange,
            onClickPageNumber,
            onClickPrevPageButton,
            onClickNextPageButton,
            onClickGoBack,
            onClickStatus,
        };
    },
};
</script>

<style lang="postcss">
.collector-history-container {
    .toolbox-top {
        .filter-button-lap {
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
                    &:before {
                    }
                }
                &.failure:hover, &.failure:focus, &.failure.active {
                    @apply text-red-500;
                }
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
