<template>
    <p-toolbox-table selectable
                     sortable
                     search-type="query"
                     :loading="loading"
                     :fields="fields"
                     :items="items"
                     :sort-by="sortBy"
                     :sort-desc="sortDesc"
                     :page-size="pageLimit"
                     :total-count="totalCount"
                     :query-tags="searchTags"
                     :key-item-sets="querySearchHandlers.keyItemSets"
                     :value-handler-map="querySearchHandlers.valueHandlerMap"
                     :multi-select="false"
                     :excel-visible="false"
                     :timezone="timezone"
                     @change="onChange"
                     @refresh="onChange()"
                     @select="onSelect"
    >
        <template #toolbox-top>
            <div class="status-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}:</span>
                <p-select-button-group :buttons="statusList" :selected.sync="selectedStatus" />
            </div>
        </template>
        <template #col-service_account-format="{ value }">
            <p-anchor :to="referenceRouter(
                value,
                { resource_type: 'identity.ServiceAccount' })"
            >
                {{ serviceAccounts[value] ? serviceAccounts[value].label : value }}
            </p-anchor>
        </template>
        <template #col-project-format="{ value }">
            <p-anchor :to="referenceRouter(
                value,
                { resource_type: 'identity.Project' })"
            >
                {{ projects[value] ? projects[value].label : value }}
            </p-anchor>
        </template>
        <template #col-status-format="{ value }">
            <span :class="value.toLowerCase()">{{ value }}</span>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {capitalize} from 'lodash';
import dayjs from 'dayjs';
import {ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,} from '@vue/composition-api';

import {PAnchor, PSelectButtonGroup, PToolboxTable} from '@spaceone/design-system';

import {referenceRouter} from '@/lib/reference/referenceRouter';
import {ApiQueryHelper} from '@/lib/space-connector/helper';
import {SpaceConnector} from '@/lib/space-connector';
import {makeEnumValueHandler, makeReferenceValueHandler} from '@/lib/component-utils/query-search';
import {JOB_TASK_STATUS} from '@/views/management/collector-history/pages/config';
import {iso8601Formatter} from '@/lib/util';
import {store} from '@/store';


const statusFormatter = (status) => {
    if (status === JOB_TASK_STATUS.progress) return 'In-Progress';
    if (status === JOB_TASK_STATUS.success) return 'Succeeded';
    return capitalize(status);
};
const durationFormatter = (createdAt, finishedAt, timezone) => {
    if (createdAt && finishedAt) {
        const createdAtTime = dayjs(iso8601Formatter(createdAt, timezone));
        const finishedAtTime = dayjs(iso8601Formatter(finishedAt, timezone));
        let duration = finishedAtTime.diff(createdAtTime, 'second');
        if (duration < 60) return `${duration} sec`;
        duration = finishedAtTime.diff(createdAtTime, 'minute');
        return `${duration} min`;
    }
    return null;
};

export default {
    name: 'JobTaskTable',
    components: {
        PToolboxTable,
        PAnchor,
        PSelectButtonGroup,
    },
    props: {
        jobId: {
            type: String,
            required: true,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            timezone: computed(() => store.state.user.timezone),
            jobTasks: [],
            items: computed(() => state.jobTasks.map(task => ({
                service_account: task.service_account_id,
                project: task.project_id,
                status: statusFormatter(task.status),
                created_count: task.created_count,
                updated_count: task.updated_count,
                'errors.length': task.errors.length,
                created_at: iso8601Formatter(task.created_at, state.timezone),
                duration: durationFormatter(task.created_at, task.finished_at, state.timezone),
            }))),
            fields: [
                { label: 'Service Account', name: 'service_account', sortable: false },
                { label: 'Project', name: 'project', sortable: false },
                { label: 'Status', name: 'status' },
                { label: 'Created', name: 'created_count' },
                { label: 'Updated', name: 'updated_count' },
                { label: 'Error', name: 'errors.length' },
                { label: 'Disconnected', name: '' },
                { label: 'Deleted', name: '' },
                { label: 'Started Time', name: 'created_at' },
                { label: 'Duration', name: 'duration', sortable: false },
            ],
            statusList: computed(() => ([
                {
                    name: 'all', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.ALL'),
                },
                {
                    name: 'inProgress', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.IN_PROGRESS'),
                },
                {
                    name: 'succeeded', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.SUCCEEDED'),
                },
                {
                    name: 'failed', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FAILED'),
                },
            ])),
            selectedStatus: 'all',
            //
            pageLimit: 15,
            pageStart: 1,
            sortBy: '',
            sortDesc: true,
            totalCount: 0,
            searchTags: [],
            // references
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            projects: computed(() => store.state.resource.project.items),
        });

        const querySearchHandlers = {
            keyItemSets: [{
                title: 'Properties',
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


        /* api */
        const apiQuery = new ApiQueryHelper().setKeyItemSets(querySearchHandlers.keyItemSets);
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(state.pageStart,
                    state.pageLimit)
                .setFiltersAsQueryTag(state.searchTags);

            let statusValues: JOB_TASK_STATUS[] = [];
            if (state.selectedStatus === 'inProgress') {
                statusValues = [JOB_TASK_STATUS.progress, JOB_TASK_STATUS.pending];
            } else if (state.selectedStatus === 'succeeded') {
                statusValues = [JOB_TASK_STATUS.success];
            } else if (state.selectedStatus === 'failed') {
                statusValues = [JOB_TASK_STATUS.failure, JOB_TASK_STATUS.error, JOB_TASK_STATUS.timeout, JOB_TASK_STATUS.canceled];
            }
            if (statusValues.length > 0) {
                apiQuery.addFilter({ k: 'status', v: statusValues, o: '=' });
            }

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
            } catch (e) {
                state.jobTasks = [];
                state.totalCount = 0;
                console.error(e);
            }
            state.loading = false;
        };

        /* event */
        const onSelect = (selectedIndexes) => {
            emit('select', state.jobTasks[selectedIndexes[0]]);
        };

        const onChange = async (options: any = {}) => {
            if (options.sortBy !== undefined) {
                state.sortBy = options.sortBy;
                state.sortDesc = options.sortDesc;
            }
            if (options.pageStart !== undefined) state.pageStart = options.pageStart;
            if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
            if (options.queryTags !== undefined) state.searchTags = options.queryTags;

            await getJobTasks();
        };

        const init = async () => {
            await Promise.all([store.dispatch('resource/project/load'), store.dispatch('resource/serviceAccount/load')]);
            await getJobTasks();
        };
        init();

        watch(() => state.selectedStatus, (selectedStatus) => {
            state.selectedStatus = selectedStatus;
            state.pageStart = 1;
            getJobTasks();
        });

        return {
            ...toRefs(state),
            querySearchHandlers,
            onSelect,
            onChange,
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-toolbox-table {
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
    }
}
</style>
