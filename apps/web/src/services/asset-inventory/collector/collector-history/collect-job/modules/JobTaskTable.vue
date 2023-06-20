<template>
    <p-toolbox-table selectable
                     sortable
                     search-type="query"
                     :loading="loading"
                     :fields="fields"
                     :items="items"
                     :select-index.sync="selectIndex"
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
                <p-select-button-group class="select-button-group"
                                       :buttons="statusList"
                                       :selected.sync="selectedStatus"
                                       theme="text"
                />
            </div>
        </template>
        <template #col-service_account_id-format="{ value }">
            <p-anchor :to="referenceRouter(
                value,
                { resource_type: 'identity.ServiceAccount' })"
            >
                {{ serviceAccounts[value] ? serviceAccounts[value].label : value }}
            </p-anchor>
        </template>
        <template #col-project_id-format="{ value }">
            <template v-if="value">
                <p-anchor :to="referenceRouter(
                    value,
                    { resource_type: 'identity.Project' })"
                >
                    {{ projects[value] ? projects[value].label : value }}
                </p-anchor>
            </template>
        </template>
        <template #col-status-format="{ value }">
            <p-status
                :text="statusTextFormatter(value)"
                :text-color="statusTextColorFormatter(value)"
                :icon="statusIconFormatter(value)"
                :icon-color="statusIconColorFormatter(value)"
                :icon-animation="value === JOB_TASK_STATUS.progress ? 'spin' : undefined"
            />
        </template>
        <template #col-errors-format="{ value }">
            {{ value.length }}
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onActivated, onDeactivated, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PAnchor, PSelectButtonGroup, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import { capitalize } from 'lodash';

import { iso8601Formatter, durationFormatter } from '@cloudforet/core-lib';
import { makeEnumValueHandler, makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, primaryDark, red } from '@/styles/colors';

import { JOB_TASK_STATUS } from '@/services/asset-inventory/collector/collector-history/lib/config';

const COMPLETED_ICON_COLOR = green[500];
const FAILED_ICON_COLOR = red[400];
const PENDING_ICON_COLOR = primaryDark;

const statusTextFormatter = (status) => {
    if (status === JOB_TASK_STATUS.progress) return 'In-Progress';
    if (status === JOB_TASK_STATUS.success) return 'Succeeded';
    return capitalize(status);
};
const statusTextColorFormatter = (status) => {
    if ([JOB_TASK_STATUS.failure, JOB_TASK_STATUS.timeout, JOB_TASK_STATUS.canceled].includes(status)) return FAILED_ICON_COLOR;
    return undefined;
};
const statusIconFormatter = (status) => {
    if (status === JOB_TASK_STATUS.success) return 'ic_check';
    if (status === JOB_TASK_STATUS.pending) return 'ic_clock';
    if (status === JOB_TASK_STATUS.progress) return 'ic_gear-filled';
    return 'ic_error-filled';
};
const statusIconColorFormatter = (status) => {
    if (status === JOB_TASK_STATUS.success) return COMPLETED_ICON_COLOR;
    if (status === JOB_TASK_STATUS.pending) return PENDING_ICON_COLOR;
    if (status === JOB_TASK_STATUS.progress) return undefined;
    return FAILED_ICON_COLOR;
};

export default {
    name: 'JobTaskTable',
    components: {
        PToolboxTable,
        PAnchor,
        PSelectButtonGroup,
        PStatus,
    },
    props: {
        jobId: {
            type: String,
            required: true,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: false,
            timezone: computed(() => store.state.user.timezone),
            items: [],
            fields: [
                { label: 'Service Account', name: 'service_account_id', sortable: false },
                { label: 'Project', name: 'project_id', sortable: false },
                { label: 'Status', name: 'status' },
                { label: 'Errors', name: 'errors' },
                { label: 'Created Count', name: 'created_count' },
                { label: 'Updated Count', name: 'updated_count' },
                { label: 'Disconnected Count', name: 'disconnected_count' },
                { label: 'Deleted Count', name: 'deleted_count' },
                { label: 'Started', name: 'started_at' },
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
            selectIndex: [],
            pageLimit: 15,
            pageStart: 1,
            sortBy: '',
            sortDesc: true,
            totalCount: 0,
            searchTags: [],
            // references
            serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
        });

        const querySearchHandlers = reactive({
            keyItemSets: computed<KeyItemSet[]>(() => [{
                title: 'Properties',
                items: [
                    {
                        name: 'service_account_id',
                        label: 'Service Account',
                        valueSet: state.serviceAccounts,
                    },
                    {
                        name: 'project_id',
                        label: 'Project',
                        valueSet: state.projects,
                    },
                    {
                        name: 'status',
                        label: 'Status',
                    },
                ],
            }]),
            valueHandlerMap: {
                service_account_id: makeReferenceValueHandler('identity.ServiceAccount'),
                project_id: makeReferenceValueHandler('identity.Project'),
                status: makeEnumValueHandler(JOB_TASK_STATUS),
            },
        });

        /* api */
        const apiQuery = new ApiQueryHelper().setKeyItemSets(querySearchHandlers.keyItemSets);
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(
                    state.pageStart,
                    state.pageLimit,
                )
                .setFiltersAsQueryTag(state.searchTags);

            let statusValues: JOB_TASK_STATUS[] = [];
            if (state.selectedStatus === 'inProgress') {
                statusValues = [JOB_TASK_STATUS.progress, JOB_TASK_STATUS.pending];
            } else if (state.selectedStatus === 'succeeded') {
                statusValues = [JOB_TASK_STATUS.success];
            } else if (state.selectedStatus === 'failed') {
                statusValues = [JOB_TASK_STATUS.failure, JOB_TASK_STATUS.timeout, JOB_TASK_STATUS.canceled];
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
                state.totalCount = res.total_count;
                state.items = res.results.map((jobTask) => ({
                    ...jobTask,
                    started_at: iso8601Formatter(jobTask.started_at, state.timezone),
                    duration: durationFormatter(jobTask.started_at, jobTask.finished_at, state.timezone),
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
                state.totalCount = 0;
            }
            state.loading = false;
        };

        /* event */
        const onSelect = (selectedIndexes) => {
            emit('select', state.items[selectedIndexes[0]]);
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

        /* Init */
        const initStates = () => {
            state.totalCount = 0;
            state.items = [];
            state.pageLimit = 15;
            state.pageStart = 1;
            state.sortBy = '';
            state.sortDesc = true;
            state.totalCount = 0;
            state.searchTags = [];
            state.selectIndex = [];
            state.selectedStatus = 'all';
        };

        let stopSelectStatusWatch;

        onActivated(async () => {
            initStates();
            await getJobTasks();

            stopSelectStatusWatch = watch(() => state.selectedStatus, () => {
                state.pageStart = 1;
                getJobTasks();
            });
        });

        onDeactivated(() => {
            if (stopSelectStatusWatch) stopSelectStatusWatch();
        });

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/serviceAccount/load'),
                store.dispatch('reference/project/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            querySearchHandlers,
            onSelect,
            onChange,
            statusTextFormatter,
            statusTextColorFormatter,
            statusIconFormatter,
            statusIconColorFormatter,
            referenceRouter,
            JOB_TASK_STATUS,
            COMPLETED_ICON_COLOR,
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

        /* custom design-system component - p-select-button-group */
        :deep(.select-button-group) {
            .button-group {
                display: flex;
            }
        }
    }
}
</style>
