<template>
    <div class="collector-history-job">
        <div class="more-information-lap">
            <div>
                <span class="info-title">Collector Name: </span>
                <span class="info-text">{{ job.collector_info.name }}</span>
            </div>
            <div>
                <span class="info-title">Provider: </span>
                <span class="info-text">{{ job.collector_info.provider }}</span>
            </div>
            <!--            <span class="toggle-button">hide</span>-->
        </div>
        <p-horizontal-layout class="job-tasks-lap">
            <template #container="{ height }">
                <p-query-search-table
                    :loading="loading"
                    :fields="fields"
                    :items="items"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    :style="{height: `${height}px`}"
                    :multi-select="false"
                    :select-index.sync="selectedIndexes"
                    :disabled-index="disabledIndex"
                    @change="getJobTasks"
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
                        <span :class="value.toLowerCase()">{{ value }}</span>
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
        <div v-if="selectedItem && selectedItem.errors.length > 0" class="error-list-lap">
            <p-panel-top :use-total-count="true" :total-count="selectedItem.errors.length">
                Error List
            </p-panel-top>
            <p-data-table :fields="errorFields"
                          :items="selectedItem.errors"
                          :sortable="false"
                          :selectable="false"
                          :row-height-fixed="false"
                          table-style-type="light"
                          bordered
            >
                <template #col-message-format="{ value }" style="width: 20rem">
                    <div class="error-message">
                        {{ value }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </div>
</template>

<script lang="ts">
import { capitalize, find } from 'lodash';
import moment from 'moment';

import { computed, reactive, toRefs } from '@vue/composition-api';

import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { timestampFormatter } from '@/lib/util';

export default {
    name: 'PCollectorHistoryDetail',
    components: {
        PDataTable,
        PPanelTop,
        PHorizontalLayout,
        PQuerySearchTable,
    },
    props: {
        job: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const state = reactive({
            loading: false,
            jobTasks: [],
            serviceAccounts: [],
            projects: [],
            items: [],
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
            fields: [
                { label: 'No.', name: 'sequence' },
                { label: 'Service Account', name: 'service_account_id' },
                { label: 'Project', name: 'project_id' },
                { label: 'Status', name: 'status' },
                { label: 'Created', name: 'created_count' },
                { label: 'Updated', name: 'updated_count' },
                { label: 'Error', name: 'errors.length' },
                { label: 'Start Time', name: 'created_at' },
                { label: 'Duration', name: 'duration' },
            ],
            errorFields: [
                { label: 'No.', name: 'sequence' },
                { label: 'Error Code', name: 'error_code' },
                { label: 'Error Message', name: 'message' },
                { label: 'Resource Type', name: 'resource_type' },
                { label: 'Resource ID', name: 'resource_id' },
            ],
            statusList: [
                { key: 'all', label: 'All', class: 'all' },
                { key: 'inProgress', label: 'In-progress', class: 'in-progress' },
                { key: 'success', label: 'Success', class: 'success' },
                { key: 'failure', label: 'Failure', class: 'failure' },
            ],
            activatedStatus: 'all',
        });

        const convertStatus = (status) => {
            if (status === 'PENDING' || status === 'IN_PROGRESS') return 'In Progress';
            return capitalize(status);
        };
        const convertServiceAccountName = (serviceAccountId) => {
            // eslint-disable-next-line camelcase
            const serviceAccount = find(state.serviceAccounts, { service_account_id: serviceAccountId });
            return serviceAccount?.name;
        };
        const convertProjectName = (projectId) => {
            // eslint-disable-next-line camelcase
            const project = find(state.projects, { project_id: projectId });
            return project?.name;
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
        const convertJobTasksToFieldItem = (jobTasks) => {
            state.items = [];
            jobTasks.forEach((task, index) => {
                const newTask = {
                    sequence: (index + 1) + ((state.thisPage - 1) * state.pageSize),
                    // eslint-disable-next-line camelcase
                    service_account_id: convertServiceAccountName(task.service_account_id),
                    // eslint-disable-next-line camelcase
                    project_id: convertProjectName(task.project_id),
                    status: convertStatus(task.status),
                    // eslint-disable-next-line camelcase
                    created_count: task.created_count,
                    // eslint-disable-next-line camelcase
                    updated_count: task.updated_count,
                    'errors.length': task.errors.length,
                    // eslint-disable-next-line camelcase
                    created_at: timestampFormatter(task.created_at),
                    duration: convertFinishedAtToDuration(task.created_at, task.finished_at),
                };
                state.items.push(newTask);
            });
        };

        const getJobTasks = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper();
                query.setSort(state.sortBy, state.sortDesc).setPage(((state.thisPage - 1) * state.pageSize) + 1, state.pageSize);

                const res = await SpaceConnector.client.inventory.jobTask.list({
                    query: query.data,
                    // eslint-disable-next-line camelcase
                    job_id: props.job.job_id,
                });
                state.jobTasks = res.results;
                state.totalCount = res.total_count;

                convertJobTasksToFieldItem(res.results);
            } catch (e) {
                console.error(e);
            }
            state.loading = false;
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

        const onSelect = (item, index) => {
            state.selectedIndexes = index;
        };
        const onClickStatus = (status) => {
            state.activatedStatus = status;
        };

        const init = async () => {
            await getServiceAccounts();
            await getProject();
            await getJobTasks();
        };
        init();

        return {
            ...toRefs(state),
            timestampFormatter,
            getJobTasks,
            convertStatus,
            convertServiceAccountName,
            convertProjectName,
            onSelect,
            onClickStatus,
        };
    },
};
</script>

<style lang="postcss">
.collector-history-job {
    .more-information-lap {
        @apply bg-primary4 border border-gray-200;
        position: relative;
        border-left-width: 0.25rem;
        font-size: 0.75rem;
        line-height: 150%;
        border-radius: 0.125rem;
        box-sizing: border-box;
        margin-bottom: 1rem;
        padding: 1rem;
        .info-title {
            @apply text-gray-400;
            font-weight: bold;
        }
        .info-text {
            @apply text-gray-900;
        }
        .toggle-button {
            @apply text-secondary;
            position: absolute;
            right: 1rem;
            bottom: 0.5rem;
            cursor: pointer;
        }
    }

    .job-tasks-lap {
        .p-query-search-table {
            .p-data-table {
                .failure {
                    @apply text-red-500;
                }
            }
        }
    }

    .error-list-lap {
        @apply border border-gray-200;
        border-radius: 0.125rem;
        padding-bottom: 2.375rem;
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
                /*white-space: nowrap;*/
                /*overflow: hidden;*/
                /*text-overflow: ellipsis;*/
            }
        }
    }
}
</style>
