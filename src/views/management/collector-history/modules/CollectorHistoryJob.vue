<template>
    <div class="collector-history-job-container">
        <p-collapsible-panel>
            <template #content>
                <div class="more-information-wrapper">
                    <div>
                        <span class="info-title">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.COLLECTOR_NAME') }}: </span>
                        <span class="info-text">{{ collectorName }}</span>
                    </div>
                    <div>
                        <span class="info-title">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.PROVIDER') }}: </span>
                        <span class="info-text">{{ provider }}</span>
                    </div>
                </div>
            </template>
        </p-collapsible-panel>
        <p-horizontal-layout class="job-tasks-wrapper">
            <template #container="{ height }">
                <p-query-search-table
                    :loading="loading"
                    :fields="fields"
                    :items="items"
                    :query-tags="searchTags"
                    :key-item-sets="querySearchHandlers.keyItemSets"
                    :value-handler-map="querySearchHandlers.valueHandlerMap"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    :total-count="totalCount"
                    :style="{height: `${height}px`}"
                    :multi-select="false"
                    :select-index.sync="selectedIndexes"
                    :disabled-index="disabledIndex"
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
                    <template #col-service_account-format="{ value }">
                        <router-link :to="referenceRouter(
                            value.service_account_id,
                            { resource_type: 'identity.ServiceAccount' })"
                        >
                            <span class="reference-link">
                                <span class="text">{{ value.name }}</span>
                                <p-i name="ic_external-link" height="1em" width="1em" />
                            </span>
                        </router-link>
                    </template>
                    <template #col-sequence-format="{ value }">
                        <span class="float-right">{{ value }}</span>
                    </template>
                    <template #col-status-format="{ value }">
                        <span :class="value.toLowerCase()">{{ value }}</span>
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
        <div v-if="selectedItem" class="error-list-wrapper">
            <p-panel-top :use-total-count="true" :total-count="selectedItem.errors.length">
                {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.ERROR_LIST') }}
            </p-panel-top>
            <div v-if="selectedItem.errors.length === 0">
                <p-empty class="w-full h-full">
                    {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.NO_DATA') }}
                </p-empty>
            </div>
            <p-data-table v-else
                          :fields="errorFields"
                          :items="errorItems"
                          :sortable="false"
                          :selectable="false"
                          :row-height-fixed="false"
                          table-style-type="light"
                          bordered
            >
                <template #col-message-format="{ value }" style="width: 20rem;">
                    <div class="error-message">
                        {{ value.replace(/\'/g, '') }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { capitalize, find } from 'lodash';
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs,
    getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PCollapsiblePanel from '@/components/molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { COLLECT_MODE, CollectorModel } from '@/views/plugin/collector/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { makeEnumValueHandler, makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { timestampFormatter } from '@/lib/util';
import { TimeStamp } from '@/models';
import { store } from '@/store';

enum JOB_TASK_STATUS {
    pending = 'PENDING',
    progress = 'IN_PROGRESS',
    success = 'SUCCESS',
    failure = 'FAILURE',
}
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
    name: 'CollectorHistoryJob',
    components: {
        PI,
        PCollapsiblePanel,
        PEmpty,
        PDataTable,
        PPanelTop,
        PHorizontalLayout,
        PQuerySearchTable,
    },
    props: {
        jobId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const querySearchHandlers = {
            keyItemSets: [{
                title: 'Filters',
                items: [
                    {
                        name: 'service_account_id',
                        label: 'Service Account',
                    },
                    {
                        name: 'project_id',
                        label: 'Project',
                    },
                    {
                        name: 'status',
                        label: 'Status',
                    },
                ],
            }],
            valueHandlerMap: {
                service_account_id: makeReferenceValueHandler('identity.ServiceAccount'),
                project_id: makeReferenceValueHandler('identity.Project'),
                status: makeEnumValueHandler(JOB_TASK_STATUS),
            },
        };
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            loading: false,
            job: {} as JobModel,
            collectorName: computed(() => state.job.collector_info?.name),
            provider: computed(() => state.job.collector_info?.provider),
            jobTasks: [],
            serviceAccounts: [],
            projects: [],
            items: [],
            errorItems: computed(() => state.selectedItem?.errors.map((d, idx) => ({
                sequence: idx + 1,
                ...d,
            }))),
            fields: [
                { label: 'No.', name: 'sequence', sortable: false },
                { label: 'Service Account', name: 'service_account', sortable: false },
                { label: 'Project', name: 'project_id', sortable: false },
                { label: 'Status', name: 'status' },
                { label: 'Created', name: 'created_count' },
                { label: 'Updated', name: 'updated_count' },
                { label: 'Error', name: 'errors.length' },
                { label: 'Start Time', name: 'created_at' },
                { label: 'Duration', name: 'duration', sortable: false },
            ],
            errorFields: [
                { label: 'No.', name: 'sequence' },
                { label: 'Error Code', name: 'error_code' },
                { label: 'Error Message', name: 'message' },
                { label: 'Resource Type', name: 'additional.resource_type' },
                { label: 'Resource ID', name: 'additional.resource_id' },
            ],
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
            //
            disabledIndex: [0, 3],
            selectedIndexes: [],
            selectedItem: computed(() => state.jobTasks[state.selectedIndexes[0]]),
            //
            pageSize: 15,
            thisPage: 1,
            sortBy: '',
            sortDesc: true,
            totalCount: 0,
            //
            searchTags: [],
        });

        /* util */
        const statusFormatter = (status) => {
            if (status === 'PENDING' || status === 'IN_PROGRESS') return 'In-Progress';
            return capitalize(status);
        };
        const serviceAccountFormatter = serviceAccountId => find(state.serviceAccounts, { service_account_id: serviceAccountId });
        const convertProjectName = (projectId) => {
            const project = find(state.projects, { project_id: projectId });
            return project?.name;
        };
        const durationFormatter = (createdAt, finishedAt) => {
            if (createdAt && finishedAt) {
                const createdAtDatetime = dayjs(timestampFormatter(createdAt, state.timezone));
                const finishedAtDatetime = dayjs(timestampFormatter(finishedAt, state.timezone));
                const duration = finishedAtDatetime.diff(createdAtDatetime, 'minute');
                return `${duration.toString()} min`;
            }
            return null;
        };
        const convertJobTasksToFieldItem = (jobTasks) => {
            state.items = [];
            jobTasks.forEach((task, index) => {
                const newTask = {
                    sequence: getPageStart(state.thisPage, state.pageSize) + index,
                    service_account: serviceAccountFormatter(task.service_account_id),
                    project_id: convertProjectName(task.project_id),
                    status: statusFormatter(task.status),
                    created_count: task.created_count,
                    updated_count: task.updated_count,
                    'errors.length': task.errors.length,
                    created_at: timestampFormatter(task.created_at, state.timezone),
                    duration: durationFormatter(task.created_at, task.finished_at),
                };
                state.items.push(newTask);
            });
        };

        /* api */
        const apiQuery = new ApiQueryHelper().setKeyItemSets(querySearchHandlers.keyItemSets);
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                .setFiltersAsQueryTag(state.searchTags);

            let statusValues: JOB_TASK_STATUS[] = [];
            if (state.activatedStatus === 'inProgress') {
                statusValues = [JOB_TASK_STATUS.progress, JOB_TASK_STATUS.pending];
            } else if (state.activatedStatus === 'success') {
                statusValues = [JOB_TASK_STATUS.success];
            } else if (state.activatedStatus === 'failure') {
                statusValues = [JOB_TASK_STATUS.failure];
            }

            statusValues.forEach((d) => {
                apiQuery.addFilter({ k: 'status', v: d, o: '=' });
            });

            return apiQuery.data;
        };
        const getJobTasks = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.jobTask.list({
                    query: getQuery(),
                    job_id: props.jobId,
                });
                state.jobTasks = res.results;
                state.totalCount = res.total_count;

                convertJobTasksToFieldItem(res.results);
            } catch (e) {
                console.error(e);
            }
            state.loading = false;
        };
        const getJob = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.job.list({ job_id: props.jobId });
                state.job = res.results[0];
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const getServiceAccounts = async () => {
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.list();
                state.serviceAccounts = res.results;
            } catch (e) {
                console.error(e);
            }
        };
        const getProject = async () => {
            try {
                const res = await SpaceConnector.client.identity.project.list();
                state.projects = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onSelect = (item, index) => {
            state.selectedIndexes = index;
        };
        const onChange = async (item) => {
            state.searchTags = item.queryTags;
            await getJobTasks();
        };
        const onClickStatus = (status) => {
            state.activatedStatus = status;
            getJobTasks();
        };

        const init = async () => {
            await getJob();
            await getServiceAccounts();
            await getProject();
            await getJobTasks();
        };
        init();

        return {
            ...toRefs(state),
            querySearchHandlers,
            timestampFormatter,
            referenceRouter,
            onSelect,
            onChange,
            onClickStatus,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collector-history-job-container {
    .more-information-wrapper {
        position: relative;
        font-size: 0.75rem;
        line-height: 150%;
        border-radius: 0.125rem;
        box-sizing: border-box;
        padding: 1rem;
        .info-title {
            @apply text-gray-400;
            font-weight: bold;
        }
        .info-text {
            @apply text-gray-900;
        }
    }

    .job-tasks-wrapper {
        .p-query-search-table {
            .p-data-table {
                .failure {
                    @apply text-red-500;
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
                    }
                    &.failure:hover, &.failure:focus, &.failure.active {
                        @apply text-red-500;
                    }
                }
            }
        }
    }

    .error-list-wrapper {
        @apply border border-gray-200;
        border-radius: 0.125rem;
        padding-bottom: 2.375rem;
        min-height: 27.5rem;
        .p-data-table {
            th {
                border-top: none;
            }
            tr:hover {
                @apply bg-gray-100;
            }
            td {
                @apply border-gray-200;
            }
            .th-contents {
                @apply text-gray-500;
            }
            .error-message {
                /* white-space: nowrap; */

                /* overflow: hidden; */

                /* text-overflow: ellipsis; */
            }
        }
    }
}
</style>
