<script setup lang="ts">
import {
    computed, onActivated, reactive,
} from 'vue';

import {
    PToolboxTable, PButton, PHeading, PBadge, PI, PLink,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import type { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import dayjs from 'dayjs';

import { makeDistinctValueHandler, makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { durationFormatter, iso8601Formatter } from '@cloudforet/utils';

import type { AlertListParameters, AlertListResponse } from '@/schema/monitoring/alert/api-verbs/list';
import { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';
import type { AlertModel } from '@/schema/monitoring/alert/model';
import { store } from '@/store';

import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import { red } from '@/styles/colors';

import AlertMainAlertCreateModal from '@/services/alert-manager/components/AlertMainAlertCreateModal.vue';
import AlertMainDataTableActions from '@/services/alert-manager/components/AlertMainDataTableActions.vue';
import AlertMainDataTableTriggeredByField from '@/services/alert-manager/components/AlertMainDataTableBottomFilters.vue';
import AlertTriggeredBy from '@/services/alert-manager/components/AlertMainDataTableTriggeredByField.vue';
import { useAlertStateI18n } from '@/services/alert-manager/composables/alert-state-i18n';
import { useAlertUrgencyI18n } from '@/services/alert-manager/composables/alert-urgency-i18n';
import {
    ALERT_STATE_FILTER, ALERT_ASSIGNED_FILTER, ALERT_URGENCY_FILTER,
} from '@/services/alert-manager/constants/alert-constant';
import { alertStateBadgeStyleTypeFormatter } from '@/services/alert-manager/helpers/alert-badge-helper';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import type {
    AlertBottomFilters, AlertListTableFilters,
    AlertStateFilter,
    AlertUrgencyFilter,
    AlertAssignedFilter,
} from '@/services/alert-manager/types/alert-type';


const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const props = withDefaults(defineProps<{
    projectId?: string;
    alertState?: AlertStateFilter;
    urgency?: AlertUrgencyFilter;
    assigned?: AlertAssignedFilter;
    filters?: ConsoleFilter[];
    keepAlive?: boolean;
    manageDisabled?: boolean;
}>(), {
    projectId: '',
    alertState: ALERT_STATE_FILTER.OPEN,
    urgency: ALERT_URGENCY_FILTER.ALL,
    assigned: ALERT_ASSIGNED_FILTER.ALL,
    filters: () => [],
    keepAlive: false,
    manageDisabled: false,
});
const emit = defineEmits<{(event: 'update', filters: Partial<AlertListTableFilters>): void;
    (event: 'change-list'): void;
}>();

/* Stores */
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    webhooks: computed<WebhookReferenceMap>(() => store.getters['reference/webhookItems']),
});

/* Search Tags */
const queryTagsHelper = useQueryTags({
    keyItemSets: computed<KeyItemSet[]>(() => {
        const items = [
            // { name: 'alert_number', label: 'Alert Number', dataType: 'integer' },
            { name: 'alert_id', label: 'Alert ID' },
            { name: 'assignee', label: 'Assignee' },
            { name: 'resource.resource_type', label: 'Resource Name' },
            {
                name: 'project_id', label: 'Project', reference: 'identity.Project', valueSet: storeState.projects,
            },
            { name: 'created_at', label: 'Created Time', dataType: 'datetime' },
            { name: 'acknowledged_at', label: 'Acknowledged Time', dataType: 'datetime' },
            { name: 'resolved_at', label: 'Resolved Time', dataType: 'datetime' },
            {
                name: 'webhook_id', label: 'Webhook', reference: 'monitoring.Webhook', valueSet: storeState.webhooks,
            },
        ];

        if (props.projectId) items.splice(2, 1);
        return [{ title: 'Properties', items }] as KeyItemSet[];
    }),
    referenceStore: {
        'identity.Project': computed(() => allReferenceStore.getters.project),
        'monitoring.Webhook': computed(() => store.getters['reference/webhookItems']),
    },
});
const { keyItemSets } = queryTagsHelper;
const valueHandlerFilters = new QueryHelper().setFilters([
    { k: 'project_id', v: props.projectId, o: '=' },
]).apiQuery.filter;
const valueHandlerMap = computed<ValueHandlerMap>(() => {
    if (props.projectId) {
        return {
            alert_id: makeDistinctValueHandler('monitoring.Alert', 'alert_id', undefined, valueHandlerFilters),
            assignee: makeDistinctValueHandler('monitoring.Alert', 'assignee', undefined, valueHandlerFilters),
            'resource.resource_type': makeDistinctValueHandler('monitoring.Alert', 'resource.resource_type', undefined, valueHandlerFilters),
            created_at: makeDistinctValueHandler('monitoring.Alert', 'created_at', 'datetime', valueHandlerFilters),
            acknowledged_at: makeDistinctValueHandler('monitoring.Alert', 'acknowledged_at', 'datetime', valueHandlerFilters),
            resolved_at: makeDistinctValueHandler('monitoring.Alert', 'resolved_at', 'datetime', valueHandlerFilters),
            webhook_id: makeReferenceValueHandler('monitoring.Webhook'),
        };
    }
    return {
        alert_id: makeDistinctValueHandler('monitoring.Alert', 'alert_id'),
        assignee: makeDistinctValueHandler('monitoring.Alert', 'assignee'),
        'resource.resource_type': makeDistinctValueHandler('monitoring.Alert', 'resource.resource_type'),
        project_id: makeReferenceValueHandler('identity.Project'),
        created_at: makeDistinctValueHandler('monitoring.Alert', 'created_at', 'datetime'),
        acknowledged_at: makeDistinctValueHandler('monitoring.Alert', 'acknowledged_at', 'datetime', valueHandlerFilters),
        resolved_at: makeDistinctValueHandler('monitoring.Alert', 'resolved_at', 'datetime'),
        webhook_id: makeReferenceValueHandler('monitoring.Webhook'),
    };
});

/* States */
const state = reactive({
    loading: true,
    selectIndex: [] as number[],
    selectedItems: computed(() => state.selectIndex.map((d) => state.items[d])),
    fields: computed(() => {
        const fields = [
            { name: 'alert_number', label: 'No' },
            { name: 'title', label: 'Title', width: '437px' },
            { name: 'state', label: 'State' },
            { name: 'urgency', label: 'Urgency' },
            { name: 'assignee', label: 'Assigned to' },
            { name: 'project_id', label: 'Project', sortable: false },
            { name: 'triggered_by', label: 'Triggered by' },
            { name: 'created_at', label: 'Duration', sortable: false },
            { name: 'created_at', label: 'Created' },
        ];

        if (state.totalCount === 0) { fields[1].width = 'auto'; }
        return fields;
    }),
    excelFields: computed(() => {
        const fields = [
            { key: 'alert_number', name: 'No' },
            { key: 'title', name: 'Title' },
            { key: 'state', name: 'State' },
            { key: 'urgency', name: 'Urgency' },
            { key: 'resource', name: 'Resource' },
            { key: 'project_id', name: 'Project' },
            { key: 'assignee', name: 'Assigned to' },
            { key: 'triggered_by', name: 'Triggered by' },
            { key: 'description', name: 'Description' },
            { key: 'created_at', name: 'Created Time', type: 'datetime' },
            { key: 'acknowledged_at', name: 'Acknowledged Time', type: 'datetime' },
            { key: 'resolved_at', name: 'Resolved Time', type: 'datetime' },
        ];

        if (props.projectId) fields.splice(6, 1);
        return fields;
    }),
    items: [] as AlertModel[],
    totalCount: 0,
    tags: computed(() => queryTagsHelper.queryTags.value),
    visibleAlertFormModal: false,
    alertStateLabels: useAlertStateI18n(),
    urgencyLabels: useAlertUrgencyI18n(),
});

/* formatters & autocomplete handlers */
const alertDurationFormatter = (value) => durationFormatter(value, dayjs().format(DATE_TIME_FORMAT), storeState.timezone) || '--';

/* event emitter */
const emitUpdate = (filters: Partial<AlertListTableFilters>) => {
    emit('update', filters);
};

/* api */
const bottomFilterQueryHelper = new QueryHelper();
const updateBottomFilterQuery = (filters: AlertBottomFilters) => {
    bottomFilterQueryHelper.setFilters([]);

    if (filters.state === ALERT_STATE_FILTER.OPEN) {
        bottomFilterQueryHelper.addFilter({ k: 'state', v: [ALERT_STATE_FILTER.TRIGGERED, ALERT_STATE_FILTER.ACKNOWLEDGED], o: '=' });
    } else if (filters.state !== ALERT_STATE_FILTER.ALL) {
        bottomFilterQueryHelper.addFilter({ k: 'state', v: filters.state, o: '=' });
    }

    if (filters.urgency !== ALERT_URGENCY_FILTER.ALL) {
        bottomFilterQueryHelper.addFilter({ k: 'urgency', v: filters.urgency, o: '=' });
    }

    if (filters.assigned === ALERT_ASSIGNED_FILTER.ASSIGNED_TO_ME) {
        bottomFilterQueryHelper.addFilter({ k: 'assignee', v: store.state.user.userId, o: '=' });
    }
};

const alertApiQueryHelper = new ApiQueryHelper()
    .setOnly(...state.fields.map((d) => d.name), 'alert_id')
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true);
let alertApiQuery = alertApiQueryHelper.data;

const getAlerts = async () => {
    state.loading = true;

    try {
        alertApiQueryHelper.setFilters([...queryTagsHelper.filters.value, ...bottomFilterQueryHelper.filters]);
        if (props.projectId) alertApiQueryHelper.addFilter({ k: 'project_id', v: props.projectId, o: '=' });
        alertApiQuery = alertApiQueryHelper.data;

        const { results, total_count } = await SpaceConnector.clientV2.monitoring.alert.list<AlertListParameters, AlertListResponse>({
            query: alertApiQuery,
        });

        state.items = results ?? [];
        state.totalCount = total_count ?? 0;
        state.selectIndex = [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.totalCount = 0;
        state.items = [];
    } finally {
        state.loading = false;
    }
};

/* event */
const handleChange = async (options: ToolboxOptions = {}) => {
    if (options.pageStart !== undefined) alertApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) alertApiQueryHelper.setPageLimit(options.pageLimit);
    if (options.sortBy !== undefined) alertApiQueryHelper.setSort(options.sortBy, options.sortDesc);

    if (options.queryTags !== undefined) {
        queryTagsHelper.setQueryTags(options.queryTags);
        emitUpdate({ filters: queryTagsHelper.filters.value });
    }

    await getAlerts();
};

const handleExportToExcel = async () => {
    await downloadExcel({
        url: '/monitoring/alert/list',
        param: {
            query: { ...alertApiQuery, only: state.excelFields.map((d) => d.key) },
        },
        fields: state.excelFields,
        file_name_prefix: FILE_NAME_PREFIX.alert,
        timezone: storeState.timezone,
    });
};

const handleUpdateBottomFilters = async (filters: AlertBottomFilters) => {
    state.thisPage = 1;
    updateBottomFilterQuery(filters);
    emitUpdate(filters);
    await getAlerts();
};

const handleAlertFormConfirm = () => {
    emit('change-list');
    getAlerts();
};

/* Init */
const initPage = () => {
    (async () => {
        state.tags = queryTagsHelper.queryTags;
        updateBottomFilterQuery({
            state: props.alertState,
            urgency: props.urgency,
            assigned: props.assigned,
        });
        await getAlerts();
    })();
};

onActivated(() => {
    initPage();
});

if (!props.keepAlive) {
    initPage();
}

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/webhook/load'),
    ]);
})();
</script>

<template>
    <fragment>
        <div class="alert-data-table">
            <p-toolbox-table
                searchable
                selectable
                sortable
                exportable
                search-type="query"
                sort-by="created_at"
                :sort-desc="true"
                :loading="state.loading"
                :fields="state.fields"
                :items="state.items"
                :select-index.sync="state.selectIndex"
                :total-count="state.totalCount"
                :query-tags="state.tags"
                :key-item-sets="keyItemSets"
                :value-handler-map="valueHandlerMap"
                @change="handleChange"
                @refresh="getAlerts()"
                @export="handleExportToExcel"
            >
                <template #toolbox-top>
                    <div class="panel-top-wrapper">
                        <p-heading heading-type="sub"
                                   use-total-count
                                   :total-count="state.totalCount"
                                   :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')"
                        >
                            <template #extra>
                                <alert-main-data-table-actions
                                    :selected-items="state.selectedItems"
                                    :manage-disabled="props.manageDisabled"
                                    @refresh="getAlerts()"
                                />
                            </template>
                        </p-heading>
                    </div>
                </template>
                <template #toolbox-left>
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              :disabled="props.manageDisabled"
                              @click="state.visibleAlertFormModal = true"
                    >
                        {{ $t('MONITORING.ALERT.ALERT_LIST.CREATE') }}
                    </p-button>
                </template>
                <template #toolbox-bottom>
                    <alert-main-data-table-triggered-by-field
                        :alert-state="props.alertState"
                        :urgency="props.urgency"
                        :assigned="props.assigned"
                        @update="handleUpdateBottomFilters"
                    />
                </template>
                <template #col-title-format="{ value, item }">
                    <template v-if="value">
                        <p-link highlight
                                :to="{
                                    name: ALERT_MANAGER_ROUTE.ALERT.DETAIL._NAME,
                                    params: { id: item.alert_id }
                                }"
                        >
                            {{ value }}
                        </p-link>
                    </template>
                </template>
                <template #col-alert_number-format="{ value, item }">
                    <p-link highlight
                            :to="{
                                name: ALERT_MANAGER_ROUTE.ALERT.DETAIL._NAME,
                                params: { id: item.alert_id }
                            }"
                    >
                        {{ value }}
                    </p-link>
                </template>
                <template #col-state-format="{ value }">
                    <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)"
                             :badge-type="value === ALERT_STATE.ERROR ? 'solid-outline' : 'subtle'"
                    >
                        {{ state.alertStateLabels[value] }}
                    </p-badge>
                </template>
                <template #col-urgency-format="{ value }">
                    <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                         width="1em"
                         height="1em"
                         class="mr-1"
                         :color="value === ALERT_URGENCY.HIGH ? red[400] : red[200]"
                    />
                    <span>{{ state.urgencyLabels[value] }}</span>
                </template>
                <template #col-resource-format="{ value }">
                    {{ value ? value.name : '' }}
                </template>
                <template #col-project_id-format="{ value }">
                    <template v-if="value">
                        <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                                new-tab
                                :to="referenceRouter(value,{ resource_type: 'identity.Project' })"
                        >
                            {{ storeState.projects[value] ? storeState.projects[value].label : value }}
                        </p-link>
                    </template>
                </template>
                <template #col-created_at-format="{value, field}">
                    <template v-if="field.label === 'Created Time'">
                        {{ iso8601Formatter(value, storeState.timezone) }}
                    </template>
                    <template v-else>
                        {{ alertDurationFormatter(value) }}
                    </template>
                </template>
                <template #col-webhook_id-format="{ value }">
                    {{ value ? (storeState.webhooks[value] ? storeState.webhooks[value].label : value) : ' ' }}
                </template>
                <template #col-triggered_by-format="{ value, item }">
                    <alert-triggered-by :value="value"
                                        :project-id="item.project_id"
                                        :webhook-reference="storeState.webhooks[value]"
                                        :user-reference="storeState.users[value]"
                                        disable-link
                    />
                </template>
                <template #col-acknowledged_at-format="{ value }">
                    {{ iso8601Formatter(value, storeState.timezone) }}
                </template>
                <template #col-resolved_at-format="{ value }">
                    {{ iso8601Formatter(value, storeState.timezone) }}
                </template>
            </p-toolbox-table>
        </div>
        <alert-main-alert-create-modal
            :visible.sync="state.visibleAlertFormModal"
            :project-id="props.projectId"
            @confirm="handleAlertFormConfirm"
        />
    </fragment>
</template>

<style lang="postcss" scoped>
.alert-data-table {
    @apply col-span-12;

    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        @apply rounded-l;
        .top-wrapper {
            @apply bg-white;
        }
        .panel-top-wrapper {
            .p-heading {
                margin-top: 1.5rem;
            }
        }
        .p-toolbox {
            @apply border-gray-200;
            border-style: solid;
            border-top-width: 1px;
            border-bottom-width: 1px;
            .p-dropdown-menu-button {
                @apply bg-white;
            }
        }
    }
}
</style>
