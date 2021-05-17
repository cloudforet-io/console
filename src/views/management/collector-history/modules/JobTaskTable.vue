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
            <div class="flex ml-4 mt-6">
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
import { PAnchor, PToolboxTable } from '@spaceone/design-system';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { store } from '@/store';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { makeEnumValueHandler, makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { JOB_TASK_STATUS } from '@/views/management/collector-history/pages/config';
import { iso8601Formatter } from '@/lib/util';
import { capitalize } from 'lodash';
import dayjs from 'dayjs';

const statusFormatter = (status) => {
    if (status === JOB_TASK_STATUS.pending || status === JOB_TASK_STATUS.progress) return 'In-Progress';
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
            items: computed(() => state.jobTasks.map((task, index) => ({
                sequence: state.pageStart + index,
                // eslint-disable-next-line camelcase
                service_account: task.service_account_id,
                project: task.project_id,
                status: statusFormatter(task.status),
                // eslint-disable-next-line camelcase
                created_count: task.created_count,
                // eslint-disable-next-line camelcase
                updated_count: task.updated_count,
                'errors.length': task.errors.length,
                created_at: iso8601Formatter(task.created_at, state.timezone),
                duration: durationFormatter(task.created_at, task.finished_at, state.timezone),
            }))),
            fields: [
                { label: 'No.', name: 'sequence', sortable: false },
                { label: 'Service Account', name: 'service_account', sortable: false },
                { label: 'Project', name: 'project', sortable: false },
                { label: 'Status', name: 'status' },
                { label: 'Created', name: 'created_count' },
                { label: 'Updated', name: 'updated_count' },
                { label: 'Error', name: 'errors.length' },
                { label: 'Start Time', name: 'created_at' },
                { label: 'Duration', name: 'duration', sortable: false },
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
            if (state.activatedStatus === 'inProgress') {
                statusValues = [JOB_TASK_STATUS.progress, JOB_TASK_STATUS.pending];
            } else if (state.activatedStatus === 'success') {
                statusValues = [JOB_TASK_STATUS.success];
            } else if (state.activatedStatus === 'failure') {
                statusValues = [JOB_TASK_STATUS.failure];
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
                    // eslint-disable-next-line camelcase
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

        const onClickStatus = (status) => {
            state.activatedStatus = status;
            getJobTasks();
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

        return {
            ...toRefs(state),
            querySearchHandlers,
            onClickStatus,
            onSelect,
            onChange,
            referenceRouter,
            JOB_TASK_STATUS,
        };
    },
};
</script>

<style lang="postcss" scoped>
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
</style>
