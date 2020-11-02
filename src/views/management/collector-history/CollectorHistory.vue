<template>
    <general-page-layout class="collector-history-container">
        <div v-if="!selectedJobId">
            <p-page-navigation :routes="route" />
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
                    :key-items="handlers.keyItems"
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
                    </template>
                    <template #th-task-format="{ value }">
                        <span>{{ value }}</span>
                        <span class="th-additional-info-text"> (completed / total)</span>
                    </template>
                    <template #col-collector_info-format="{ value }">
                        <p-lazy-img
                            :src="providers.find(d => d.provider === value.provider).tags.icon"
                            width="1rem" height="1rem"
                        />
                        <span class="pl-2">{{ value.name }}</span>
                    </template>
                    <template #col-sequence-format="{ value }">
                        <span class="float-right">{{ value }}</span>
                    </template>
                    <template #col-status-format="{ value }">
                        <p-lottie v-if="['CANCELED', 'ERROR', 'TIMEOUT'].includes(value)"
                                  class="status-icon"
                                  :size="1" :auto="true" name="lottie_error"
                        />
                        <p-lottie v-else-if="['IN_PROGRESS'].includes(value)"
                                  class="status-icon"
                                  :size="1" :auto="true" name="lottie_working"
                        />
                        <p-i v-else name="ic_done"
                             width="1rem" height="1rem"
                        />
                        <span :class="value.toLowerCase()" class="pl-2">{{ statusFormatter(value) }}</span>
                    </template>
                    <template #col-created_at-format="{value}">
                        {{ timestampFormatter(value) }}
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
                        @click="$router.push({ name: 'createCollector' })"
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
/* eslint-disable camelcase */
import { capitalize } from 'lodash';

import {
    computed, getCurrentInstance, reactive, toRefs, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/common/page-layout/GeneralPageLayout.vue';
import PCollectorHistoryJob from '@/views/management/collector-history/modules/CollectorHistoryJob.vue';
import PCollectorHistoryChart from '@/views/management/collector-history/modules/CollectorHistoryChart.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PPagination from '@/components/organisms/paginations/pagination/PPagination.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { QuerySearchTableFunctions } from '@/components/organisms/tables/query-search-table/type';
import { KeyItem } from '@/components/organisms/search/query-search/type';

import { ProviderModel } from '@/views/identity/service-account/type';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { timestampFormatter } from '@/lib/util';
import { getFiltersFromQueryTags } from '@/lib/component-utils/query-search-tags';
import { queryStringToQueryTags, queryTagsToQueryString } from '@/lib/router-query-string';
import { makeEnumValueHandler, makeDistinctValueHandler } from '@/lib/component-utils/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';
import { store } from '@/store';
import router from '@/routes';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';
import { TimeStamp } from '@/models';

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
        const handlers = {
            keyItems: [
                {
                    name: 'job_id',
                    label: 'Job ID',
                },
                {
                    name: 'status',
                    label: 'Status',
                },
                {
                    dataType: 'datetime',
                    name: 'created_at',
                    label: 'Start Time',
                },
            ],
            valueHandlerMap: {
                // eslint-disable-next-line camelcase
                job_id: makeDistinctValueHandler('inventory.Job', 'job_id'),
                status: makeEnumValueHandler(JOB_STATUS),
            },
        };
        const state = reactive({
            loading: false,
            providers: [] as ProviderModel[],
            isDomainOwner: computed(() => store.state.user.userType === 'DOMAIN_OWNER'),
            pageTitle: computed(() => (state.selectedJobId ? state.selectedJobId : 'Collector History')),
            fields: computed(() => [
                { label: 'Job ID', name: 'job_id' },
                { label: 'Collector Name', name: 'collector_info', sortable: false },
                { label: 'Status', name: 'status' },
                { label: 'Task', name: 'task' },
                { label: 'Start Time', name: 'created_at' },
                { label: 'Duration', name: 'duration', sortable: false },
            ]),
            statusList: [
                { key: 'all', label: 'All', class: 'all' },
                { key: 'inProgress', label: 'In-Progress', class: 'in-progress' },
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
            tags: queryStringToQueryTags(vm.$route.query.filters, handlers.keyItems as KeyItem[]),
            querySearchRef: null as null|QuerySearchTableFunctions,
            modalHeaderTitle: 'Need to Set a Collector',
            modalVisible: false,
            modalContent: '<b>Looks like you don\'t have any collector.</b><br/>Set a collector first and then use Collector History.',
        });
        const routeState = reactive({
            route: [
                { name: 'Management', path: '/management/collector-history' },
                { name: 'Collector History', path: '/management/collector-history' },
            ],
        });
        const subRouteState = reactive({
            subRoute: computed(() => [
                { name: 'Management', path: '/management/collector-history' },
                { name: 'Collector History', path: '/management/collector-history' },
                { name: 'Job Management', path: `/management/collector-history#${state.selectedJobId}` },
            ]),
        });

        const statusFormatter = (status) => {
            if (status === 'PENDING' || status === 'IN_PROGRESS') return 'In-Progress';
            return capitalize(status);
        };
        const durationFormatter = (createdAt, finishedAt) => {
            if (createdAt && finishedAt) {
                const createdAtMoment = dayjs(timestampFormatter(createdAt));
                const finishedAtMoment = dayjs(timestampFormatter(finishedAt));
                const duration = finishedAtMoment.diff(createdAtMoment, 'minute');
                return `${duration.toString()} min`;
            }
            return null;
        };
        const convertJobsToFieldItem = (jobs) => {
            state.items = [];
            jobs.forEach((job, index) => {
                const newJob = {
                    sequence: getPageStart(state.thisPage, state.pageSize) + index,
                    task: `${job.total_tasks - job.remained_tasks} / ${job.total_tasks}`,
                    duration: durationFormatter(job.created_at, job.finished_at),
                    ...job,
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

            const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(state.tags);

            const query = new QueryHelper()
                .setSort(state.sortBy, state.sortDesc)
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                .setKeyword(...keywords)
                .setFilterOr(...orFilters);

            if (statusValues.length > 0) {
                andFilters.push({
                    k: 'status',
                    v: statusValues,
                    o: 'in',
                });
            }
            query.setFilter(...andFilters);
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
        const getProviders = async () => {
            try {
                const query = new QueryHelper();
                query.setOnly('provider', 'tags.icon');
                const res = await SpaceConnector.client.identity.provider.list({ query: query.data });
                state.providers = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        const onSelect = (item) => {
            state.selectedJobId = item.job_id;
            // eslint-disable-next-line no-empty-function
            vm.$router.push({ path: router.currentRoute.fullPath, query: { ...router.currentRoute.query }, hash: item.job_id }).catch(() => {});
        };
        const onChange = async (item) => {
            state.tags = item.queryTags;
            const urlQueryString = queryTagsToQueryString(item.queryTags);
            // eslint-disable-next-line no-empty-function
            await vm.$router.replace({ query: { ...router.currentRoute.query, filters: urlQueryString } }).catch(() => {});
            try {
                await getJobs();
            } catch (e) {
                console.error(e);
            }
        };
        const onPaginationChange = async () => {
            await getJobs();
        };

        const onClickGoBack = () => {
            state.selectedJobId = '';
            // eslint-disable-next-line no-empty-function
            vm.$router.replace({ query: { ...router.currentRoute.query }, hash: '' }).catch(() => {});
        };
        const onClickStatus = (status) => {
            state.activatedStatus = status;
            state.thisPage = 1;
            getJobs();
        };

        const init = async () => {
            await getProviders();

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
            statusFormatter,
            timestampFormatter,
            onClickDate,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collector-history-container {
    .toolbox-top {
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
            .status-icon {
                display: inline-flex;
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
