<template>
    <div class="alert-data-table">
        <p-toolbox-table
            style-type="light-gray"
            searchable
            selectable
            sortable
            exportable
            search-type="query"
            :loading="loading"
            :fields="fields"
            :items="items"
            :select-index.sync="selectIndex"
            sort-by="created_at"
            :sort-desc="true"
            :page-size="15"
            :total-count="totalCount"
            :query-tags="tags"
            :key-item-sets="handlers.keyItemSets"
            :value-handler-map="handlers.valueHandlerMap"
            @change="onChange"
            @refresh="listAlerts"
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
                            <p-button v-for="(button, index) in buttonGroup"
                                      :key="index"
                                      :style-type="button.styleType"
                                      :outline="true"
                                      :class="{'disabled': button.disabled}"
                                      @click="onSelectAction(button)"
                            >
                                {{ button.label }}
                            </p-button>
                        </template>
                    </p-panel-top>
                </div>
            </template>
            <template #toolbox-left>
                <p-icon-text-button
                    class="mr-4"
                    style-type="primary-dark"
                    name="ic_plus_bold"
                >
                    {{ $t('MONITORING.ALERT.ALERT_LIST.CREATE') }}
                </p-icon-text-button>
            </template>
            <template #toolbox-bottom>
                <div class="filter-wrapper">
                    <div class="filter">
                        <span class="filter-label">{{ $t('MONITORING.ALERT.ALERT_LIST.STATE') }}</span>
                        <p-select-status v-for="(status, idx) in statusList" :key="idx"
                                         v-model="selectedAlertState"
                                         :value="status.name"
                                         @change="onChange"
                        >
                            {{ status.label }}
                        </p-select-status>
                    </div>
                    <div class="right-part">
                        <div class="filter">
                            <span class="filter-label">{{ $t('MONITORING.ALERT.ALERT_LIST.URGENCY') }}</span>
                            <p-select-status v-for="(urgency, idx) in urgencyList" :key="idx"
                                             v-model="selectedUrgency"
                                             :value="urgency.name"
                                             class="mr-2"
                                             @change="onChange"
                            >
                                {{ urgency.label }}
                            </p-select-status>
                        </div>
                        <div class="filter">
                            <p-select-button v-for="(state, idx) in assignedStateList" :key="`assigned-${idx}`"
                                             v-model="selectedAssignedState"
                                             :value="state.name"
                                             size="sm"
                                             style-type="gray"
                                             @change="onSelectAssignedState"
                            >
                                {{ state.label }}
                            </p-select-button>
                        </div>
                    </div>
                </div>
            </template>
            <template #col-title-format="{ value, item }">
                <template v-if="value">
                    <router-link class="alert-title"
                                 :to="{
                                     name: MONITORING_ROUTE.ALERT_SYSTEM.ALERT.DETAIL._NAME,
                                     params: { id: item.alert_id }
                                 }"
                    >
                        {{ value }}
                    </router-link>
                </template>
            </template>
            <template #col-state-format="{ value }">
                <p-badge :style-type="badgeStyleTypeFormatter(value)">
                    {{ capitalize(value) }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_alert' : 'ic_state_duplicated'"
                     width="1em" height="1em" class="mr-1"
                     :class="{'ic_state_duplicated': !(value === ALERT_URGENCY.HIGH)}"
                />
                <span class="title">{{ capitalize(value) }}</span>
            </template>
            <template #col-project_id-format="{ value }">
                <template v-if="value">
                    <p-anchor :to="referenceRouter(value,{ resource_type: 'identity.Project' })">
                        {{ projects[value] ? projects[value].label : value }}
                    </p-anchor>
                </template>
            </template>
            <template #col-webhook_id-format="{ value }">
                {{ value ? webhookFormatter(value) : ' ' }}
            </template>
        </p-toolbox-table>
        <delete-modal
            :header-title="$t('MONITORING.ALERT.ALERT_LIST.FORM.DELETE_MODAL_TITLE')"
            :visible.sync="visibleDeleteModal"
            @confirm="deleteConfirm"
        />
        <alert-resolve-modal
            :visible.sync="visibleResolveModal"
            :alert="selectedItem"
            @confirm="listAlerts"
        />
    </div>
</template>
<script lang="ts">
/* eslint-disable camelcase */
import {
    PToolboxTable, PSelectStatus, PSelectButton, PIconTextButton, PButton, PPanelTop, PBadge, PI, PAnchor,
} from '@spaceone/design-system';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';
import AlertResolveModal from '@/views/monitoring/alert/modules/alert-list/AlertResolveModal.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import {
    durationFormatter, iso8601Formatter, showErrorMessage, showLoadingMessage, showSuccessMessage,
} from '@/lib/util';
import { capitalize } from 'lodash';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { makeDistinctValueHandler, makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import dayjs from 'dayjs';
import { store } from '@/store';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import { FILE_NAME_PREFIX } from '@/lib/type';
import { ALERT_ACTION } from '@/views/monitoring/alert/type';

const ALERT_STATE = Object.freeze({
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ALL: 'ALL',
});
const ALERT_URGENCY = Object.freeze({
    ALL: 'ALL',
    HIGH: 'HIGH',
    LOW: 'LOW',
});
const ASSIGNED_STATE = Object.freeze({
    ALL: 'ALL',
    ASSIGNED_TO_ME: 'ASSIGNED_TO_ME',
});

export default {
    name: 'AlertDataTable',
    components: {
        PToolboxTable,
        PSelectStatus,
        PSelectButton,
        PIconTextButton,
        PButton,
        PPanelTop,
        PBadge,
        PI,
        PAnchor,
        DeleteModal,
        AlertResolveModal,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new ApiQueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const handlers = {
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'title', label: 'Title' },
                    { name: 'state', label: 'State' },
                    { name: 'status_message', label: 'Status Details' },
                    { name: 'project_id', label: 'Project' },
                    { name: 'created_at', label: 'Created' },
                    { name: 'assignee', label: 'Assigned to' },
                    { name: 'webhook_id', label: 'Triggered by' },
                ],
            }],
            valueHandlerMap: {
                title: makeDistinctValueHandler('monitoring.Alert', 'title'),
                state: makeDistinctValueHandler('monitoring.Alert', 'state'),
                status_message: makeDistinctValueHandler('monitoring.Alert', 'status_message'),
                project_id: makeReferenceValueHandler('identity.Project'),
                created_at: makeDistinctValueHandler('monitoring.Alert', 'created_at'),
                assignee: makeDistinctValueHandler('monitoring.Alert', 'assignee'),
                webhook_id: makeDistinctValueHandler('monitoring.Alert', 'assignee'),
            },
        };
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            projects: computed(() => store.state.resource.project.items),
            loading: true,
            selectIndex: [] as number[],
            selectedItems: computed(() => state.selectIndex.map(d => state.items[d])),
            selectedItem: computed(() => state.items[state.selectIndex[0]]),
            items: [] as any,
            totalCount: 0,
            pageStart: 1,
            pageLimit: 15,
            selectedAlertState: ALERT_STATE.OPEN,
            selectedUrgency: ALERT_URGENCY.ALL,
            selectedAssignedState: ASSIGNED_STATE.ALL,
            isAssignedToMe: false,
            keyItemSets: handlers.keyItemSets as KeyItemSet[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            buttonGroup: computed(() => ([
                {
                    name: 'acknowledge',
                    styleType: 'primary',
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
                    disabled: state.selectIndex.length !== 1 || state.selectedItems[0]?.state !== ALERT_STATE.TRIGGERED,
                },
                {
                    name: 'resolve',
                    styleType: 'secondary-dark',
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.RESOLVE'),
                    disabled: state.selectIndex.length !== 1 || state.selectedItems[0]?.state === ALERT_STATE.RESOLVED,
                },
                {
                    name: 'merge',
                    styleType: 'primary-dark',
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.MERGE'),
                    disabled: state.selectIndex.length < 2,
                },
                {
                    name: 'delete',
                    styleType: 'alert',
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.DELETE'),
                    disabled: state.selectIndex.length !== 1,
                },
            ])),
            fields: [
                { name: 'alert_number', label: 'No' },
                { name: 'title', label: 'Title' },
                { name: 'state', label: 'State' },
                { name: 'urgency', label: 'Urgency' },
                { name: 'status_message', label: 'Status Details' },
                { name: 'project_id', label: 'Project' },
                { name: 'created_at', label: 'Created', type: 'datetime' },
                { name: 'duration', label: 'Duration', sortable: false },
                { name: 'assignee', label: 'Assigned to' },
                { name: 'webhook_id', label: 'Triggered by' },
            ],
            excelFields: [
                { key: 'alert_number', name: 'No' },
                { key: 'title', name: 'Title' },
                { key: 'state', name: 'State' },
                { key: 'urgency', name: 'Urgency' },
                { key: 'status_message', name: 'Status Details' },
                { key: 'project_id', name: 'Project' },
                { key: 'created_at', name: 'Created', type: 'datetime' },
                { key: 'assignee', name: 'Assigned to' },
                { key: 'webhook_id', name: 'Triggered by' },
            ],
            statusList: computed(() => ([
                {
                    name: ALERT_STATE.OPEN,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.OPEN'),
                },
                {
                    name: ALERT_STATE.TRIGGERED,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.TRIGGERED'),
                },
                {
                    name: ALERT_STATE.ACKNOWLEDGED,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
                },
                {
                    name: ALERT_STATE.RESOLVED,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.RESOLVED'),
                },
                {
                    name: ALERT_STATE.ALL,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL'),
                },
            ])),
            urgencyList: computed(() => ([
                {
                    name: ALERT_URGENCY.ALL,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL'),
                },
                {
                    name: ALERT_URGENCY.HIGH,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.HIGH'),
                },
                {
                    name: ALERT_URGENCY.LOW,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.LOW'),
                },
            ])),
            assignedStateList: computed(() => [
                {
                    name: ASSIGNED_STATE.ALL,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL'),
                },
                {
                    name: ASSIGNED_STATE.ASSIGNED_TO_ME,
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_ME'),

                },
            ]),
            webhookNameList: [] as any,
        });
        const formState = reactive({
            visibleDeleteModal: false,
            visibleResolveModal: false,
        });

        /* util */
        const badgeStyleTypeFormatter = (alertState) => {
            if (alertState === ALERT_STATE.TRIGGERED) return 'red100';
            if (alertState === ALERT_STATE.ACKNOWLEDGED) return 'blue200';
            return 'gray200';
        };
        const webhookFormatter = (webhookId) => {
            const webhookName = state.webhookNameList.find(element => element.webhook_id === webhookId)?.name;
            return webhookName;
        };

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(state.pageStart, state.pageLimit)
                .setFilters(queryHelper.filters);

            if (state.selectedAlertState === ALERT_STATE.OPEN) {
                apiQuery.addFilter({ k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' });
            } else if (state.selectedAlertState !== ALERT_STATE.ALL) {
                apiQuery.addFilter({ k: 'state', v: state.selectedAlertState, o: '=' });
            }

            if (state.selectedUrgency !== ALERT_URGENCY.ALL) {
                apiQuery.addFilter({ k: 'urgency', v: state.selectedUrgency, o: '=' });
            }

            if (state.isAssignedToMe) {
                apiQuery.addFilter({ k: 'assignee', v: store.state.user.userId, o: '=' });
            }
            return apiQuery.data;
        };
        const listAlerts = async () => {
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
                    query: getQuery(),
                });
                state.items = results.map(d => ({
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                    duration: durationFormatter(d.created_at, dayjs().format('YYYY-MM-DD HH:mm:ss'), state.timezone) || '--',
                    ...d,
                }));
                state.totalCount = total_count;
                state.selectIndex = [];
            } catch (e) {
                state.totalCount = 0;
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const updateToAcknowledged = async () => {
            await SpaceConnector.client.monitoring.alert.update({
                alert_id: state.selectedItems[0].alert_id,
                state: ALERT_STATE.ACKNOWLEDGED,
            });
        };
        const deleteConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.delete({
                    alert_id: state.selectedItems[0].alert_id,
                });
                await listAlerts();
                showSuccessMessage(vm.$t('MONITORING.ALERT.ALERT_LIST.FORM.ALT_S_DELETE'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ALERT_LIST.FORM.ALT_S_DELETE'), e, root);
            } finally {
                formState.visibleDeleteModal = false;
            }
        };
        const getWebhook = async () => {
            const { results } = await SpaceConnector.client.monitoring.webhook.list({
                query: { only: ['webhook_id', 'name'] },
            });
            state.webhookNameList = results;
        };

        /* event */
        const onChange = async (options) => {
            if (options.sortBy !== undefined) {
                state.sortBy = options.sortBy;
                state.sortDesc = options.sortDesc;
            }
            if (options.pageStart !== undefined) state.pageStart = options.pageStart;
            if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
            if (options.queryTags !== undefined) {
                state.tags = options.queryTags;
                queryHelper.setFiltersAsQueryTag(options.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }
            await listAlerts();
        };
        const onSelectAssignedState = (assignedState) => {
            state.isAssignedToMe = assignedState === ASSIGNED_STATE.ASSIGNED_TO_ME;
            listAlerts();
        };
        const onExportToExcel = async () => {
            try {
                await store.dispatch('file/downloadExcel', {
                    url: '/monitoring/alert/list',
                    param: { query: getQuery() },
                    fields: state.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.alert,
                });
                showLoadingMessage(vm.$t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', vm.$root);
            } catch (e) {
                console.error(e);
            }
        };
        const onClickAcknowledged = async () => {
            try {
                await updateToAcknowledged();
                showSuccessMessage(vm.$t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '', root);
                await listAlerts();
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'), e, root);
            }
        };
        const onSelectAction = (button) => {
            if (button.disabled) return;
            if (button.name === ALERT_ACTION.acknowledge) {
                onClickAcknowledged();
            } else if (button.name === ALERT_ACTION.resolve) {
                formState.visibleResolveModal = true;
            } else if (button.name === ALERT_ACTION.merge) {
                alert('merge');
            } else if (button.name === ALERT_ACTION.delete) {
                formState.visibleDeleteModal = true;
            }
        };

        (async () => {
            await Promise.all([
                store.dispatch('resource/project/load'),
                listAlerts(),
                getWebhook(),
            ]);
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            handlers,
            ALERT_URGENCY,
            ALERT_STATE,
            MONITORING_ROUTE,
            referenceRouter,
            capitalize,
            badgeStyleTypeFormatter,
            iso8601Formatter,
            webhookFormatter,
            listAlerts,
            onChange,
            onSelectAssignedState,
            onExportToExcel,
            onSelectAction,
            deleteConfirm,
        };
    },
};
</script>
<style lang="postcss" scoped>
.alert-data-table {
    @apply col-span-12;
    .p-toolbox-table::v-deep {
        @apply overflow-hidden rounded-lg;
        .panel-top-wrapper {
            @apply bg-white;
            .p-panel-top {
                margin-top: 1.5rem;
                .extra {
                    @apply flex-grow-0 ml-auto;
                }
                .p-button {
                    margin-left: 0.5rem;
                }
            }
        }
        .p-dropdown-menu-button {
            @apply bg-white;
        }
    }
    .filter-wrapper {
        @apply flex justify-between;
        padding: 0.75rem 1rem;
        .filter {
            @apply flex items-center;
            .filter-label {
                @apply text-gray-400;
                margin-right: 1rem;
                font-size: 0.875rem;
                line-height: 1.15;
            }
            .p-status {
                margin-right: 1rem;
                font-size: 0.875rem;
                line-height: 1.15;
                &:last-child {
                    @apply mr-0;
                }
            }
            .p-select-button {
                @apply bg-white;
                margin-right: 0.375rem;
                &:last-child {
                    @apply mr-0;
                }
                &.selected {
                    @apply bg-gray-500;
                }
            }
            &:last-child {
                margin-left: 1rem;
            }
        }
        .right-part {
            @apply flex items-center;
        }
    }

    .alert-title {
        @apply text-blue-600;
    }
    .ic_state_duplicated path {
        fill: theme('colors.red.200');
    }
}

</style>
