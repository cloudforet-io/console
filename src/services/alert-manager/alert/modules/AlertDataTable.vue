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
                :loading="loading"
                :fields="fields"
                :items="items"
                :select-index.sync="selectIndex"
                :total-count="totalCount"
                :query-tags="tags"
                :key-item-sets="querySearchHandlerState.keyItemSets"
                :value-handler-map="querySearchHandlerState.valueHandlerMap"
                @change="onChange"
                @refresh="getAlerts()"
                @export="onExportToExcel"
            >
                <template #toolbox-top>
                    <div class="panel-top-wrapper">
                        <p-panel-top
                            use-total-count
                            :total-count="totalCount"
                            :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')"
                        >
                            <template #extra>
                                <alert-actions :selected-items="selectedItems"
                                               :manage-disabled="manageDisabled"
                                               @refresh="getAlerts()"
                                />
                            </template>
                        </p-panel-top>
                    </div>
                </template>
                <template #toolbox-left>
                    <p-button class="mr-4"
                              style-type="primary"
                              icon-left="ic_plus_bold"
                              :disabled="manageDisabled"
                              @click="visibleAlertFormModal = true"
                    >
                        {{ $t('MONITORING.ALERT.ALERT_LIST.CREATE') }}
                    </p-button>
                </template>
                <template #toolbox-bottom>
                    <alert-table-bottom-filters
                        :alert-state="alertState"
                        :urgency="urgency"
                        :assigned="assigned"
                        @update="onUpdateBottomFilters"
                    />
                </template>
                <template #col-title-format="{ value, item }">
                    <template v-if="value">
                        <p-anchor hide-icon
                                  highlight
                                  :to="{
                                      name: ALERT_MANAGER_ROUTE.ALERT.DETAIL._NAME,
                                      params: { id: item.alert_id }
                                  }"
                        >
                            {{ value }}
                        </p-anchor>
                    </template>
                </template>
                <template #col-state-format="{ value }">
                    <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)"
                             :outline="value === ALERT_STATE.ERROR"
                    >
                        {{ alertStateLabels[value] }}
                    </p-badge>
                </template>
                <template #col-urgency-format="{ value }">
                    <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_alert' : 'ic_urgency_low'"
                         width="1em"
                         height="1em"
                         class="mr-1"
                         :class="{'ic_urgency_low': !(value === ALERT_URGENCY.HIGH)}"
                    />
                    <span>{{ urgencyLabels[value] }}</span>
                </template>
                <template #col-resource-format="{ value }">
                    {{ value ? value.name : '' }}
                </template>
                <template #col-project_id-format="{ value }">
                    <template v-if="value">
                        <p-anchor :to="referenceRouter(value,{ resource_type: 'identity.Project' })">
                            {{ storeState.projects[value] ? storeState.projects[value].label : value }}
                        </p-anchor>
                    </template>
                </template>
                <template #col-created_at-format="{value, field}">
                    <template v-if="field.label === 'Created'">
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
            </p-toolbox-table>
        </div>
        <alert-form-modal :visible.sync="visibleAlertFormModal"
                          :project-id="projectId"
                          @confirm="onAlertFormConfirm"
        />
    </fragment>
</template>
<script lang="ts">
import {
    computed, onActivated, reactive, toRefs,
} from 'vue';

import {
    PToolboxTable, PButton, PPanelTop, PBadge, PI, PAnchor,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { durationFormatter, iso8601Formatter, commaFormatter } from '@cloudforet/core-lib';
import { makeDistinctValueHandler, makeReferenceValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';
import type { WebhookReferenceMap } from '@/store/modules/reference/webhook/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertActions from '@/services/alert-manager/alert/modules/AlertActions.vue';
import AlertFormModal from '@/services/alert-manager/alert/modules/AlertFormModal.vue';
import AlertTableBottomFilters from '@/services/alert-manager/alert/modules/AlertTableBottomFilters.vue';
import AlertTriggeredBy from '@/services/alert-manager/alert/modules/AlertTriggeredBy.vue';
import { useAlertStateI18n } from '@/services/alert-manager/composables/alert-state-i18n';
import { useAlertUrgencyI18n } from '@/services/alert-manager/composables/alert-urgency-i18n';
import {
    ALERT_STATE, ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE,
} from '@/services/alert-manager/lib/config';
import { alertStateBadgeStyleTypeFormatter } from '@/services/alert-manager/lib/helper';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import type {
    AlertBottomFilters, AlertListTableFilters,
} from '@/services/alert-manager/type';

const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export default {
    name: 'AlertDataTable',
    components: {
        AlertFormModal,
        AlertTableBottomFilters,
        AlertActions,
        AlertTriggeredBy,
        PToolboxTable,
        PButton,
        PPanelTop,
        PBadge,
        PI,
        PAnchor,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        alertState: {
            type: String,
            default: ALERT_STATE_FILTER.OPEN,
        },
        urgency: {
            type: String,
            default: ALERT_URGENCY.ALL,
        },
        assigned: {
            type: String,
            default: ASSIGNED_STATE.ALL,
        },
        filters: {
            type: Array,
            default: () => [],
        },
        keepAlive: {
            type: Boolean,
            default: false,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const tagQueryHelper = new ApiQueryHelper().setFilters(props.filters);

        const valueHandlerFilters = new QueryHelper().setFilters([
            { k: 'project_id', v: props.projectId, o: '=' },
        ]).apiQuery.filter;

        const storeState = reactive({
            timezone: computed(() => store.state.user.timezone),
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            webhooks: computed<WebhookReferenceMap>(() => store.getters['reference/webhookItems']),
        });

        const querySearchHandlerState = reactive({
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
                    { name: 'resolved_at', label: 'Resolved Time', dataType: 'datetime' },
                    {
                        name: 'webhook_id', label: 'Webhook', reference: 'monitoring.Webhook', valueSet: storeState.webhooks,
                    },
                ];

                if (props.projectId) items.splice(2, 1);
                return [{ title: 'Properties', items }] as KeyItemSet[];
            }),
            valueHandlerMap: computed(() => {
                if (props.prjectId) {
                    return {
                        // alert_number: makeDistinctValueHandler('monitoring.Alert', 'alert_number', 'integer', valueHandlerFilters),
                        alert_id: makeDistinctValueHandler('monitoring.Alert', 'alert_id', undefined, valueHandlerFilters),
                        assignee: makeDistinctValueHandler('monitoring.Alert', 'assignee', undefined, valueHandlerFilters),
                        'resource.resource_type': makeDistinctValueHandler('monitoring.Alert', 'resource.resource_type', undefined, valueHandlerFilters),
                        created_at: makeDistinctValueHandler('monitoring.Alert', 'created_at', 'datetime', valueHandlerFilters),
                        resolved_at: makeDistinctValueHandler('monitoring.Alert', 'resolved_at', 'datetime', valueHandlerFilters),
                        webhook_id: makeReferenceValueHandler('monitoring.Webhook'),
                    };
                }
                return {
                    // alert_number: makeDistinctValueHandler('monitoring.Alert', 'alert_number', 'integer'),
                    alert_id: makeDistinctValueHandler('monitoring.Alert', 'alert_id'),
                    assignee: makeDistinctValueHandler('monitoring.Alert', 'assignee'),
                    'resource.resource_type': makeDistinctValueHandler('monitoring.Alert', 'resource.resource_type'),
                    project_id: makeReferenceValueHandler('identity.Project'),
                    created_at: makeDistinctValueHandler('monitoring.Alert', 'created_at', 'datetime'),
                    resolved_at: makeDistinctValueHandler('monitoring.Alert', 'resolved_at', 'datetime'),
                    webhook_id: makeReferenceValueHandler('monitoring.Webhook'),
                };
            }),
        });

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
                    { name: 'status_message', label: 'Status Updates' },
                    { name: 'resource', label: 'Resource' },
                    { name: 'project_id', label: 'Project', sortable: false },
                    { name: 'created_at', label: 'Created' },
                    { name: 'created_at', label: 'Duration', sortable: false },
                    { name: 'assignee', label: 'Assigned to' },
                    { name: 'triggered_by', label: 'Triggered by' },
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
                    { key: 'status_message', name: 'Status Details' },
                    { key: 'resource', name: 'Resource' },
                    { key: 'project_id', name: 'Project' },
                    { key: 'created_at', name: 'Created', type: 'datetime' },
                    { key: 'assignee', name: 'Assigned to' },
                    { key: 'triggered_by', name: 'Triggered by' },
                ];

                if (props.projectId) fields.splice(6, 1);
                return fields;
            }),
            items: [] as any,
            totalCount: 0,
            tags: tagQueryHelper.setKeyItemSets(querySearchHandlerState.keyItemSets).queryTags,
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

            if (filters.urgency !== ALERT_URGENCY.ALL) {
                bottomFilterQueryHelper.addFilter({ k: 'urgency', v: filters.urgency, o: '=' });
            }

            if (filters.assigned === ASSIGNED_STATE.ASSIGNED_TO_ME) {
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
                alertApiQueryHelper.setFilters([...tagQueryHelper.filters, ...bottomFilterQueryHelper.filters]);
                if (props.projectId) alertApiQueryHelper.addFilter({ k: 'project_id', v: props.projectId, o: '=' });
                alertApiQuery = alertApiQueryHelper.data;

                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
                    query: alertApiQuery,
                });

                state.items = results;
                state.totalCount = total_count;
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
        const onChange = async (options: any = {}) => {
            if (options.pageStart !== undefined) alertApiQueryHelper.setPageStart(options.pageStart);
            if (options.pageLimit !== undefined) alertApiQueryHelper.setPageLimit(options.pageLimit);
            if (options.sortBy !== undefined) alertApiQueryHelper.setSort(options.sortBy, options.sortDesc);

            if (options.queryTags !== undefined) {
                tagQueryHelper.setFiltersAsQueryTag(options.queryTags);
                emitUpdate({ filters: tagQueryHelper.filters });
            }

            await getAlerts();
        };

        const onExportToExcel = async () => {
            await store.dispatch('file/downloadExcel', {
                url: '/monitoring/alert/list',
                param: {
                    query: alertApiQuery,
                },
                fields: state.excelFields,
                file_name_prefix: FILE_NAME_PREFIX.alert,
            });
        };

        const onUpdateBottomFilters = async (filters: AlertBottomFilters) => {
            state.thisPage = 1;
            updateBottomFilterQuery(filters);
            emitUpdate(filters);
            await getAlerts();
        };

        const onAlertFormConfirm = () => {
            emit('change-list');
            getAlerts();
        };

        /* Init */
        const initPage = () => {
            (async () => {
                state.tags = tagQueryHelper.setFilters(props.filters).queryTags;
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
                store.dispatch('reference/user/load'),
                store.dispatch('reference/project/load'),
            ]);
            state.tags = tagQueryHelper.setReference({
                'identity.Project': computed(() => store.getters['reference/projectItems']),
                'monitoring.Webhook': computed(() => store.getters['reference/webhookItems']),
            }).setKeyItemSets(querySearchHandlerState.keyItemSets).queryTags;
        })();

        return {
            ...toRefs(state),
            querySearchHandlerState,
            storeState,
            ALERT_STATE,
            ALERT_URGENCY,
            ALERT_STATE_FILTER,
            ALERT_MANAGER_ROUTE,
            ASSIGNED_STATE,
            referenceRouter,
            alertStateBadgeStyleTypeFormatter,
            getAlerts,
            onChange,
            onExportToExcel,
            onUpdateBottomFilters,
            onAlertFormConfirm,
            iso8601Formatter,
            alertDurationFormatter,
            commaFormatter,
        };
    },
};
</script>
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
            .p-panel-top {
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
