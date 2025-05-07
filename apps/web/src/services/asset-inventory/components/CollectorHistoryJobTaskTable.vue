<script setup lang="ts">
import {
    computed, onActivated, onDeactivated, reactive, watch,
} from 'vue';


import { makeEnumValueHandler, makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PLink, PSelectButtonGroup, PStatus, PToolboxTable,
} from '@cloudforet/mirinae';
import { durationFormatter, iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { JobTaskListParameters } from '@/schema/inventory/job-task/api-verbs/list';
import type { JobTaskModel } from '@/schema/inventory/job-task/model';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';
import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    statusIconColorFormatter,
    statusIconFormatter,
    statusTextColorFormatter,
    statusTextFormatter,
} from '@/services/asset-inventory/helpers/collector-history-formatter-helper';
import { JOB_SELECTED_STATUS, JOB_TASK_STATE } from '@/services/asset-inventory/types/collector-history-page-type';

interface Props {
    jobId: string;
}

const props = withDefaults(defineProps<Props>(), {
    jobId: '',
});

const adminFields = [
    { label: 'Service Account', name: 'service_account_id', sortable: false },
    { label: 'Workspace', name: 'workspace_id' },
    { label: 'Project', name: 'project_id', sortable: false },
    { label: 'Status', name: 'status' },
    { label: 'Errors', name: 'errors' },
    { label: 'Created Count', name: 'created_count' },
    { label: 'Updated Count', name: 'updated_count' },
    { label: 'Failure Count', name: 'failure_count' },
    { label: 'Disconnected Count', name: 'disconnected_count' },
    { label: 'Deleted Count', name: 'deleted_count' },
    { label: 'Started', name: 'started_at' },
    { label: 'Duration', name: 'duration', sortable: false },
];

const fields = adminFields.filter((f) => f.name !== 'workspace_id');

const statusList = computed(() => [
    { name: JOB_SELECTED_STATUS.ALL, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.ALL') },
    { name: JOB_SELECTED_STATUS.PROGRESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.IN_PROGRESS') },
    { name: JOB_SELECTED_STATUS.SUCCESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.SUCCESS') },
    { name: JOB_SELECTED_STATUS.FAILURE, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.FAILURE') },
    { name: JOB_SELECTED_STATUS.PENDING, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.PENDING') },
]);

const emit = defineEmits<{(e: 'select', array): void}>();

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const userStore = useUserStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceStore.getters.serviceAccount),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    workspaces: computed(() => allReferenceStore.getters.workspace),
});

const { getReferenceLocation } = useReferenceRouter();

const state = reactive({
    loading: false,
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    items: [] as ({duration: string} & JobTaskModel)[],
    selectedStatus: 'ALL',
    //
    selectIndex: [],
    pageLimit: 15,
    pageStart: 1,
    sortBy: '',
    sortDesc: true,
    totalCount: 0,
    searchTags: [],
});

const querySearchHandlers = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            {
                name: 'service_account_id',
                label: 'Service Account',
                valueSet: storeState.serviceAccounts,
            },
            {
                name: 'project_id',
                label: 'Project',
                valueSet: storeState.projects,
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
        status: makeEnumValueHandler(JOB_SELECTED_STATUS),
    },
});

const apiQueryHelper = new ApiQueryHelper().setKeyItemSets(querySearchHandlers.keyItemSets);
const getQuery = () => {
    apiQueryHelper.setSort(state.sortBy, state.sortDesc)
        .setPage(state.pageStart, state.pageLimit)
        .setFiltersAsQueryTag(state.searchTags);

    let statusValues: string[] = [];
    if (state.selectedStatus === JOB_SELECTED_STATUS.PROGRESS) {
        statusValues = [JOB_TASK_STATE.IN_PROGRESS];
    } else if (state.selectedStatus === JOB_SELECTED_STATUS.SUCCESS) {
        statusValues = [JOB_TASK_STATE.SUCCESS];
    } else if (state.selectedStatus === JOB_SELECTED_STATUS.FAILURE) {
        statusValues = [JOB_TASK_STATE.FAILURE];
    } else if (state.selectedStatus === JOB_SELECTED_STATUS.PENDING) {
        statusValues = [JOB_TASK_STATE.PENDING];
    }

    if (statusValues.length > 0) {
        apiQueryHelper.addFilter({ k: 'status', v: statusValues, o: '=' });
    }

    return apiQueryHelper.data;
};


/* Components */
const handleSelect = (selectedIndexes: number) => {
    emit('select', state.items[selectedIndexes[0]]);
};
const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) {
        state.sortBy = options.sortBy;
        state.sortDesc = options.sortDesc;
    }
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.queryTags !== undefined) state.searchTags = options.queryTags;

    await getJobTasks();
};

/* API */
const getJobTasks = async () => {
    state.loading = true;
    try {
        const res = await SpaceConnector.clientV2.inventory.jobTask.list<JobTaskListParameters, ListResponse<JobTaskModel>>({
            query: getQuery(),
            job_id: props.jobId,
        });
        state.totalCount = res.total_count ?? 0;
        state.items = (res.results ?? []).map((jobTask) => ({
            ...jobTask,
            started_at: iso8601Formatter(jobTask.started_at, state.timezone) || '--',
            duration: durationFormatter(jobTask.started_at, jobTask.finished_at, state.timezone) || '--',
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    }
    state.loading = false;
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
    state.selectedStatus = 'ALL';
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
</script>

<template>
    <p-toolbox-table selectable
                     sortable
                     search-type="query"
                     :loading="state.loading"
                     :fields="storeState.isAdminMode ? adminFields : fields"
                     :items="state.items"
                     :select-index.sync="state.selectIndex"
                     :sort-by="state.sortBy"
                     :sort-desc="state.sortDesc"
                     :page-size="state.pageLimit"
                     :total-count="state.totalCount"
                     :query-tags="state.searchTags"
                     :key-item-sets="querySearchHandlers.keyItemSets"
                     :value-handler-map="querySearchHandlers.valueHandlerMap"
                     :multi-select="false"
                     :excel-visible="false"
                     :timezone="state.timezone"
                     @change="handleChange"
                     @refresh="handleChange()"
                     @select="handleSelect"
    >
        <template #toolbox-top>
            <div class="status-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}:</span>
                <p-select-button-group class="select-button-group"
                                       :buttons="statusList"
                                       :selected.sync="state.selectedStatus"
                                       theme="text"
                />
            </div>
        </template>
        <template #col-service_account_id-format="{ value, item }">
            <p-link v-if="storeState.serviceAccounts[value]"
                    action-icon="internal-link"
                    new-tab
                    :to="getReferenceLocation(
                        value,
                        {
                            resource_type: 'identity.ServiceAccount',
                            workspace_id: storeState.isAdminMode ? undefined : item.workspace_id,
                            isAdminMode: storeState.isAdminMode,
                        })"
            >
                {{ storeState.serviceAccounts[value].label }}
            </p-link>
            <span v-else>--</span>
        </template>
        <template v-if="storeState.isAdminMode"
                  #col-workspace_id-format="{ value }"
        >
            <span v-if="value === '*'">Global</span>
            <p-link v-else
                    :to="{
                        name: ROOT_ROUTE.WORKSPACE._NAME,
                        params: { workspaceId: value },
                    }"
                    action-icon="internal-link"
                    new-tab
                    :text="storeState.workspaces[value]?.label"
            />
        </template>
        <template #col-project_id-format="{ value, item }">
            <p-link v-if="storeState.projects[value]"
                    action-icon="internal-link"
                    new-tab
                    :to="getReferenceLocation(
                        value,
                        { resource_type: 'identity.Project', workspace_id: item.workspace_id })"
            >
                {{ storeState.projects[value].label }}
            </p-link>
            <span v-else>--</span>
        </template>
        <template #col-status-format="{ value }">
            <p-status
                :text="statusTextFormatter(value)"
                :text-color="statusTextColorFormatter(value)"
                :icon="statusIconFormatter(value)"
                :icon-color="statusIconColorFormatter(value)"
                :icon-animation="value === JOB_TASK_STATE.IN_PROGRESS ? 'spin' : undefined"
            />
        </template>
        <template #col-errors-format="{ value }">
            {{ value ? value.length : 0 }}
        </template>
        <template #col-created_count-format="{ value }">
            {{ value ?? 0 }}
        </template>
        <template #col-updated_count-format="{ value }">
            {{ value ?? 0 }}
        </template>
        <template #col-failure_count-format="{ value }">
            {{ value ?? 0 }}
        </template>
        <template #col-disconnected_count-format="{ value }">
            {{ value ?? 0 }}
        </template>
        <template #col-deleted_count-format="{ value }">
            {{ value ?? 0 }}
        </template>
    </p-toolbox-table>
</template>

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
