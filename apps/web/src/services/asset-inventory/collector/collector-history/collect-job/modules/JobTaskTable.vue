<template>
    <p-toolbox-table selectable
                     sortable
                     search-type="query"
                     :loading="state.loading"
                     :fields="fields"
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
        <template #col-service_account_id-format="{ value }">
            <p-anchor :to="referenceRouter(
                value,
                { resource_type: 'identity.ServiceAccount' })"
            >
                {{ storeState.serviceAccounts[value] ? storeState.serviceAccounts[value].label : value }}
            </p-anchor>
        </template>
        <template #col-project_id-format="{ value }">
            <template v-if="value">
                <p-anchor :to="referenceRouter(
                    value,
                    { resource_type: 'identity.Project' })"
                >
                    {{ storeState.projects[value] ? storeState.projects[value].label : value }}
                </p-anchor>
            </template>
        </template>
        <!-- TODO: will be checked "Pending" after API is updated-->
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
            {{ value.length }}
        </template>
    </p-toolbox-table>
</template>

<script setup lang="ts">
import {
    computed, onActivated, onDeactivated, reactive, watch,
} from 'vue';

import {
    PAnchor, PSelectButtonGroup, PStatus, PToolboxTable,
} from '@spaceone/design-system';

import { iso8601Formatter, durationFormatter } from '@cloudforet/core-lib';
import { makeEnumValueHandler, makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    statusIconColorFormatter,
    statusIconFormatter,
    statusTextColorFormatter,
    statusTextFormatter,
} from '@/services/asset-inventory/collector/collector-history/lib/formatter-helper';
import { JOB_SELECTED_STATUS, JOB_TASK_STATE } from '@/services/asset-inventory/collector/collector-history/type';

interface Props {
    jobId: string;
}

const props = withDefaults(defineProps<Props>(), {
    jobId: '',
});

const fields = [
    { label: 'Service Account', name: 'service_account_id', sortable: false },
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

const statusList = [
    { name: JOB_SELECTED_STATUS.ALL, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.ALL') },
    { name: JOB_SELECTED_STATUS.PROGRESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.IN_PROGRESS') },
    { name: JOB_SELECTED_STATUS.SUCCESS, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.SUCCESS') },
    { name: JOB_SELECTED_STATUS.FAILURE, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.FAILURE') },
    { name: JOB_SELECTED_STATUS.PENDING, label: i18n.t('INVENTORY.COLLECTOR.HISTORY.PENDING') },
];

const emit = defineEmits<{(e: 'select', array): void}>();

const storeState = reactive({
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
});

const state = reactive({
    loading: false,
    timezone: computed(() => store.state.user.timezone),
    items: [],
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

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/serviceAccount/load'),
        store.dispatch('reference/project/load'),
    ]);
})();
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
