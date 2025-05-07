<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import { clone } from 'lodash';

import { makeDistinctValueHandler, makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PButton, PHeading, PBadge, PI, PLink, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { durationFormatter, iso8601Formatter } from '@cloudforet/utils';

import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { AlertListParameters, AlertListResponse } from '@/schema/monitoring/alert/api-verbs/list';
import { ALERT_STATE, ALERT_URGENCY } from '@/schema/monitoring/alert/constants';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { red } from '@/styles/colors';

import AlertMainAlertCreateModal from '@/services/alert-manager/v1/components/AlertMainAlertCreateModal.vue';
import AlertMainDataTableActions from '@/services/alert-manager/v1/components/AlertMainDataTableActions.vue';
import AlertMainDataTableTriggeredByField from '@/services/alert-manager/v1/components/AlertMainDataTableBottomFilters.vue';
import AlertTriggeredBy from '@/services/alert-manager/v1/components/AlertMainDataTableTriggeredByField.vue';
import { useAlertStateI18n } from '@/services/alert-manager/v1/composables/alert-state-i18n';
import { useAlertUrgencyI18n } from '@/services/alert-manager/v1/composables/alert-urgency-i18n';
import {
    ALERT_STATE_FILTER, ALERT_ASSIGNED_FILTER, ALERT_URGENCY_FILTER,
} from '@/services/alert-manager/v1/constants/alert-constant';
import { alertStateBadgeStyleTypeFormatter } from '@/services/alert-manager/v1/helpers/alert-badge-helper';
import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';
import type {
    AlertBottomFilters, AlertListTableFilters,
    AlertStateFilter,
    AlertUrgencyFilter,
    AlertAssignedFilter,
} from '@/services/alert-manager/v1/types/alert-type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const router = useRouter();
const route = useRoute();

const { getReferenceLocation } = useReferenceRouter();

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
const userWorkspaceStore = useUserWorkspaceStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone || ''),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    webhooks: computed<WebhookReferenceMap>(() => allReferenceStore.getters.webhook),
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
        'monitoring.Webhook': computed(() => allReferenceStore.getters.webhook),
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

const DEFAULT_FIELD:DataTableFieldType[] = [
    { name: 'alert_number', label: 'No' },
    { name: 'title', label: 'Title', width: '20rem' },
    { name: 'state', label: 'State' },
    { name: 'urgency', label: 'Urgency' },
    { name: 'resources', label: 'Resource', width: '20rem' },
    { name: 'created_at', label: 'Created' },
    { name: 'duration', label: 'Duration', sortable: false },
    { name: 'assignee', label: 'Assigned to' },
    { name: 'triggered_by', label: 'Triggered by' },
];

/* States */
const state = reactive({
    loading: true,
    selectIndex: [] as number[],
    selectedItems: computed(() => state.selectIndex.map((d) => state.items[d])),
    fields: DEFAULT_FIELD,
    excelFields: computed(() => {
        const fields = [
            { key: 'alert_number', name: 'No' },
            { key: 'title', name: 'Title' },
            { key: 'state', name: 'State' },
            { key: 'urgency', name: 'Urgency' },
            { key: 'resources', name: 'Resource' },
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
    thisPage: 1,
    pageLimit: 15,
    pageStart: 1,
    totalCount: 0,
    tags: computed(() => queryTagsHelper.queryTags.value),
    visibleAlertFormModal: false,
    alertStateLabels: useAlertStateI18n(),
    urgencyLabels: useAlertUrgencyI18n(),
    visibleCustomFieldModal: false,
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[state.selectedMenuId]?.write),
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
        bottomFilterQueryHelper.addFilter({ k: 'assignee', v: userStore.state.userId || '', o: '=' });
    }
};

const alertApiQueryHelper = new ApiQueryHelper()
    .setOnly(...state.fields.map((d) => d.name).filter((name) => name !== 'duration'), 'alert_id')
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
    if (options.pageStart !== undefined) {
        alertApiQueryHelper.setPageStart(options.pageStart);
        state.pageStart = options.pageStart;
        state.thisPage = Math.ceil(options.pageStart / state.pageLimit);
        router.replace({
            query: {
                ...router.currentRoute.query,
                pageStart: options.pageStart?.toString(),
            },
        }).catch(() => {});
    }
    if (options.pageLimit !== undefined) {
        alertApiQueryHelper.setPageLimit(options.pageLimit);
        state.pageLimit = options.pageLimit;
        router.replace({
            query: {
                ...router.currentRoute.query,
                pageLimit: options.pageLimit?.toString(),
            },
        }).catch(() => {});
    }
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
    updateBottomFilterQuery(filters);
    emitUpdate(filters);
    await getAlerts();
};

const handleAlertFormConfirm = () => {
    emit('change-list');
    getAlerts();
};

const handleClickSettings = () => {
    state.visibleCustomFieldModal = true;
};

const handleVisibleCustomFieldModal = (visible) => {
    state.visibleCustomFieldModal = visible;
};

const handleCustomFieldModalConfirm = () => {
    getAlerts();
};

const handleCustomFieldUpdate = (fields: DataTableFieldType[]) => {
    state.fields = fields;
};
/* Init */
const initPage = () => {
    (async () => {
        if (route.query.pageStart) {
            state.pageStart = Number(route.query.pageStart) || state.pageStart;
            state.pageLimit = Number(route.query.pageLimit) || state.pageLimit;
            alertApiQueryHelper.setPageStart(state.pageStart);
        }
        state.tags = queryTagsHelper.queryTags;
        updateBottomFilterQuery({
            state: props.alertState,
            urgency: props.urgency,
            assigned: props.assigned,
        });
        await getAlerts();

        // thisPage should be the last to change.
        // The reason is that if there is a change in totalCount, it will be changed to 1.
        // The cause is inferred from checking the event relationship of PToolboxTable, PToolbox, PTextPagination.
        state.thisPage = Math.ceil(state.pageStart / state.pageLimit);
    })();
};

initPage();
</script>

<template>
    <div>
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
                :this-page="state.thisPage"
                :key-item-sets="keyItemSets"
                :value-handler-map="valueHandlerMap"
                settings-visible
                @change="handleChange"
                @click-settings="handleClickSettings"
                @refresh="getAlerts()"
                @export="handleExportToExcel"
            >
                <template #toolbox-top>
                    <div class="panel-top-wrapper">
                        <p-heading-layout class="pt-8 px-4 pb-4">
                            <template #heading>
                                <p-heading heading-type="sub"
                                           use-total-count
                                           :total-count="state.totalCount"
                                           :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')"
                                />
                            </template>
                            <template v-if="state.hasReadWriteAccess"
                                      #extra
                            >
                                <alert-main-data-table-actions
                                    :selected-items="state.selectedItems"
                                    :manage-disabled="props.manageDisabled"
                                    @refresh="getAlerts()"
                                />
                            </template>
                        </p-heading-layout>
                    </div>
                </template>
                <template v-if="state.hasReadWriteAccess"
                          #toolbox-left
                >
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
                                    name: ALERT_MANAGER_ROUTE_V1.ALERTS.DETAIL._NAME,
                                    params: { id: item.alert_id }
                                }"
                        >
                            <span class="title-link">{{ value }}</span>
                        </p-link>
                    </template>
                </template>
                <template #col-alert_number-format="{ value, item }">
                    <p-link highlight
                            :to="{
                                name: ALERT_MANAGER_ROUTE_V1.ALERTS.DETAIL._NAME,
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
                <template #col-resources-format="{ value }">
                    <span v-if="(value ?? []).length === 0">
                        --
                    </span>
                    <template v-else>
                        <p class="additional-info">
                            {{ value?.[0]?.name }}
                        </p>
                    </template>
                </template>
                <template #col-project_id-format="{ value }">
                    <template v-if="value">
                        <p-link action-icon="internal-link"
                                new-tab
                                :to="getReferenceLocation(value,{
                                    resource_type: 'identity.Project',
                                    workspace_id: userWorkspaceStore.getters.currentWorkspaceId,
                                })"
                        >
                            {{ storeState.projects[value] ? storeState.projects[value].label : value }}
                        </p-link>
                    </template>
                </template>
                <template #col-duration-format="{item}">
                    {{ alertDurationFormatter(item.created_at) }}
                </template>
                <template #col-created_at-format="{value}">
                    {{ iso8601Formatter(value, storeState.timezone) }}
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
        <custom-field-modal :visible="state.visibleCustomFieldModal"
                            resource-type="monitoring.alert"
                            :default-field="DEFAULT_FIELD"
                            @update:visible="handleVisibleCustomFieldModal"
                            @complete="handleCustomFieldModalConfirm"
                            @custom-field-loaded="handleCustomFieldUpdate"
        />
    </div>
</template>

<style lang="postcss" scoped>
.alert-data-table {
    @apply col-span-12;

    .title-link {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 3;

        /* display: inline-block; */
        -webkit-box-orient: vertical;
    }

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
