<template>
    <div>
        <p-pane-layout v-if="!projectId" class="filter-assigned-alerts">
            <p-panel-top :title="$t('MONITORING.ALERT.ALERT_LIST.OPEN_ALERT')" :total-count="countTotalAssignedAlerts" use-total-count />
            <div class="filter-wrapper">
                <span class="filter text-alert mr-4" @click="onClickAssignedAlerts(ALERT_STATE.TRIGGERED)">
                    <em>{{ counts[ALERT_STATE.TRIGGERED] }}</em>
                    {{ $t('MONITORING.ALERT.ALERT_LIST.TRIGGERED') }}
                </span>
                <span class="filter text-secondary" @click="onClickAssignedAlerts(ALERT_STATE.ACKNOWLEDGED)">
                    <em>{{ counts[ALERT_STATE.ACKNOWLEDGED] }}</em>
                    {{ $t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED') }}
                </span>
            </div>
        </p-pane-layout>
        <div class="alert-data-table">
            <p-toolbox-table
                style-type="light-gray"
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
                :key-item-sets="handlers.keyItemSets"
                :value-handler-map="handlers.valueHandlerMap"
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
                                <p-button v-for="(button, index) in buttonGroup"
                                          :key="index"
                                          class="only-desktop action-button"
                                          :style-type="button.styleType"
                                          :outline="true"
                                          :class="{'disabled': button.disabled}"
                                          @click="onSelectAction(button)"
                                >
                                    {{ button.label }}
                                </p-button>
                                <p-dropdown-menu-btn class="only-mobile"
                                                     :menu="buttonGroup"
                                                     @click-acknowledge="onClickAcknowledged()"
                                                     @click-resolve="onClickResolve()"
                                                     @click-merge="onClickMerge()"
                                                     @click-delete="onClickDelete()"
                                >
                                    {{ $t('PLUGIN.COLLECTOR.MAIN.ACTION') }}
                                </p-dropdown-menu-btn>
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
                        <div class="filter filter-state">
                            <span class="filter-label">{{ $t('MONITORING.ALERT.ALERT_LIST.STATE') }}</span>
                            <p-select-status v-for="(status, idx) in statusList" :key="idx"
                                             v-model="selectedAlertState"
                                             :value="status.name"
                                             @change="onChange"
                            >
                                {{ status.label }}
                            </p-select-status>
                        </div>
                        <div class="filter filter-urgency">
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
                        <div class="filter filter-assigned">
                            <p-select-button v-for="(assigned, idx) in assignedStateList"
                                             :key="`assigned-${idx}`"
                                             v-model="selectedAssignedState"
                                             :value="assigned.name"
                                             size="sm"
                                             style-type="gray"
                                             class="only-desktop"
                                             @change="onSelectAssignedState"
                            >
                                {{ assigned.label }}
                            </p-select-button>
                            <p-check-box v-model="isAssignedToMe"
                                         class="only-mobile"
                            >
                                <span>{{ $t('MONITORING.ALERT.DASHBOARD.ASSIGNED_TO_ME') }}</span>
                            </p-check-box>
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
        </div>
        <delete-modal
            :header-title="$t('MONITORING.ALERT.ALERT_LIST.DELETE_MODAL.TITLE')"
            :visible.sync="visibleDeleteModal"
            @confirm="deleteConfirm"
        />
        <alert-resolve-modal
            :visible.sync="visibleResolveModal"
            :alert="selectedItem"
            @confirm="getAlerts"
        />
    </div>
</template>
<script lang="ts">
/* eslint-disable camelcase */
import {
    PToolboxTable, PSelectStatus, PSelectButton, PIconTextButton, PButton, PPanelTop, PBadge, PI, PAnchor, PIconButton, PCheckBox, PDropdownMenuBtn, PPaneLayout,
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
import { capitalize, find } from 'lodash';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { makeDistinctValueHandler, makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import dayjs from 'dayjs';
import { store } from '@/store';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import { FILE_NAME_PREFIX } from '@/lib/type';
import { ALERT_ACTION } from '@/views/monitoring/alert/type';
import { i18n } from '@/translations';

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
const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

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
        PDropdownMenuBtn,
        PCheckBox,
        PPaneLayout,
        DeleteModal,
        AlertResolveModal,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
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
                    { name: 'created_at', label: 'Created', dataType: 'datetime' },
                    { name: 'assignee', label: 'Assigned to' },
                    { name: 'webhook_id', label: 'Triggered by' },
                ],
            }] as KeyItemSet[],
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
            selectedItem: computed(() => state.items[state.selectIndex[0]]),
            items: [] as any,
            totalCount: 0,
            isAssignedToMe: false,
            keyItemSets: handlers.keyItemSets as KeyItemSet[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            fields: [
                { name: 'alert_number', label: 'No' },
                { name: 'title', label: 'Title' },
                { name: 'state', label: 'State' },
                { name: 'urgency', label: 'Urgency' },
                { name: 'status_message', label: 'Status Details' },
                { name: 'project_id', label: 'Project' },
                { name: 'created_at', label: 'Created' },
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
            buttonGroup: computed(() => ([
                {
                    name: 'acknowledge',
                    styleType: 'primary',
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
                    disabled: state.selectIndex.length !== 1 || state.selectedItem?.state !== ALERT_STATE.TRIGGERED,
                },
                {
                    name: 'resolve',
                    styleType: 'secondary-dark',
                    label: vm.$t('MONITORING.ALERT.ALERT_LIST.RESOLVE'),
                    disabled: state.selectIndex.length !== 1 || state.selectedItem?.state === ALERT_STATE.RESOLVED,
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
            selectedAlertState: ALERT_STATE.OPEN,
            selectedUrgency: ALERT_URGENCY.ALL,
            selectedAssignedState: ASSIGNED_STATE.ALL,
            statusList: [
                { name: ALERT_STATE.OPEN, label: vm.$t('MONITORING.ALERT.ALERT_LIST.OPEN') },
                { name: ALERT_STATE.ACKNOWLEDGED, label: vm.$t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED') },
                { name: ALERT_STATE.TRIGGERED, label: vm.$t('MONITORING.ALERT.ALERT_LIST.TRIGGERED') },
                { name: ALERT_STATE.RESOLVED, label: vm.$t('MONITORING.ALERT.ALERT_LIST.RESOLVED') },
                { name: ALERT_STATE.ALL, label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL') },
            ],
            urgencyList: [
                { name: ALERT_URGENCY.ALL, label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL') },
                { name: ALERT_URGENCY.HIGH, label: vm.$t('MONITORING.ALERT.ALERT_LIST.HIGH') },
                { name: ALERT_URGENCY.LOW, label: vm.$t('MONITORING.ALERT.ALERT_LIST.LOW') },
            ],
            assignedStateList: [
                { name: ASSIGNED_STATE.ALL, label: vm.$t('MONITORING.ALERT.ALERT_LIST.ALL') },
                { name: ASSIGNED_STATE.ASSIGNED_TO_ME, label: vm.$t('MONITORING.ALERT.ALERT_LIST.ASSIGNED_TO_ME') },
            ],
            webhookNameList: [] as any,
            //
            countsAssignedAlerts: [],
            counts: computed(() => ({
                TRIGGERED: find(state.countsAssignedAlerts, { state: ALERT_STATE.TRIGGERED })?.total || 0,
                ACKNOWLEDGED: find(state.countsAssignedAlerts, { state: ALERT_STATE.ACKNOWLEDGED })?.total || 0,
                RESOLVED: find(state.countsAssignedAlerts, { state: ALERT_STATE.RESOLVED })?.total || 0,
            })),
            countTotalAssignedAlerts: computed(() => state.counts[ALERT_STATE.TRIGGERED] + state.counts[ALERT_STATE.ACKNOWLEDGED]),
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
        const webhookFormatter = webhookId => state.webhookNameList.find(element => element.webhook_id === webhookId)?.name;

        /* api */
        const alertsApiQuery = new ApiQueryHelper();
        const alertsQuery = () => {
            alertsApiQuery.setSort(state.sortBy, state.sortDesc)
                .setPageStart(1).setPageLimit(15)
                .setFilters(queryHelper.filters);

            if (props.projectId) alertsApiQuery.addFilter({ k: 'project_id', v: props.projectId, o: '=' });

            if (state.selectedAlertState === ALERT_STATE.OPEN) {
                alertsApiQuery.addFilter({ k: 'state', v: [ALERT_STATE.TRIGGERED, ALERT_STATE.ACKNOWLEDGED], o: '=' });
            } else if (state.selectedAlertState !== ALERT_STATE.ALL) {
                alertsApiQuery.addFilter({ k: 'state', v: state.selectedAlertState, o: '=' });
            }

            if (state.selectedUrgency !== ALERT_URGENCY.ALL) {
                alertsApiQuery.addFilter({ k: 'urgency', v: state.selectedUrgency, o: '=' });
            }

            if (state.isAssignedToMe) {
                alertsApiQuery.addFilter({ k: 'assignee', v: store.state.user.userId, o: '=' });
            }

            return alertsApiQuery.data;
        };
        const getAlerts = async () => {
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.alert.list({
                    query: alertsQuery(),
                });
                state.items = results.map(d => ({
                    ...d,
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                    duration: durationFormatter(d.created_at, dayjs().format(DATE_TIME_FORMAT), state.timezone) || '--',
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
                alert_id: state.selectedItem.alert_id,
                state: ALERT_STATE.ACKNOWLEDGED,
            });
        };
        const deleteConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.delete({
                    alert_id: state.selectedItem.alert_id,
                });
                await getAlerts();
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.ALT_S_DELETE'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.FORM.ALT_S_DELETE'), e, root);
            } finally {
                formState.visibleDeleteModal = false;
            }
        };
        const getWebhooks = async () => {
            const { results } = await SpaceConnector.client.monitoring.webhook.list({
                query: { only: ['webhook_id', 'name'] },
            });
            state.webhookNameList = results;
        };
        const statAlerts = async () => {
            try {
                const { results } = await SpaceConnector.client.statistics.topic.alertStateCount({
                    assignee: store.state.user.userId,
                });
                state.countsAssignedAlerts = results;
            } catch (e) {
                console.error(e);
            }
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
                state.selectedUrgency = ALERT_URGENCY.ALL;
                state.selectedAlertState = ALERT_STATE.ALL;
                state.isAssignedToMe = false;
                state.tags = options.queryTags;
                queryHelper.setFiltersAsQueryTag(options.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }
            await getAlerts();
        };
        const onSelectAssignedState = (assignedState) => {
            state.isAssignedToMe = assignedState === ASSIGNED_STATE.ASSIGNED_TO_ME;
            getAlerts();
        };
        const onExportToExcel = async () => {
            try {
                await store.dispatch('file/downloadExcel', {
                    url: '/monitoring/alert/list',
                    param: { query: alertsQuery() },
                    fields: state.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.alert,
                });
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);
            } catch (e) {
                console.error(e);
            }
        };
        const onClickAcknowledged = async () => {
            try {
                await updateToAcknowledged();
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_STATE_CHANGED'), '', root);
                await getAlerts();
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_STATE_CHANGED'), e, root);
            }
        };
        const onClickResolve = () => {
            formState.visibleResolveModal = true;
        };
        const onClickMerge = () => {
            alert('merge');
        };
        const onClickDelete = () => {
            formState.visibleResolveModal = true;
        };
        const onSelectAction = (button) => {
            if (button.disabled) return;
            if (button.name === ALERT_ACTION.acknowledge) {
                onClickAcknowledged();
            } else if (button.name === ALERT_ACTION.resolve) {
                onClickResolve();
            } else if (button.name === ALERT_ACTION.merge) {
                onClickMerge();
            } else if (button.name === ALERT_ACTION.delete) {
                onClickDelete();
            }
        };
        const onClickAssignedAlerts = (alertStat) => {
            state.selectedAlertState = alertStat;
            state.selectedUrgency = ALERT_STATE.ALL;
            state.isAssignedToMe = true;
            getAlerts();
        };

        watch(() => state.isAssignedToMe, async () => {
            state.thisPage = 1;
            await getAlerts();
        });

        (async () => {
            await Promise.all([store.dispatch('resource/project/load'), getAlerts(), getWebhooks(), statAlerts()]);
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
            webhookFormatter,
            badgeStyleTypeFormatter,
            getAlerts,
            onChange,
            onExportToExcel,
            onSelectAssignedState,
            onSelectAction,
            onClickAcknowledged,
            onClickResolve,
            onClickMerge,
            onClickDelete,
            onClickAssignedAlerts,
            deleteConfirm,
        };
    },
};
</script>
<style lang="postcss" scoped>
.filter-assigned-alerts {
    @apply col-span-12 rounded-lg;
    padding-bottom: 1rem;
    .p-panel-top::v-deep {
        margin-top: 1rem;
        margin-bottom: 0.25rem;
        .title, .total-count {
            font-size: 1rem;
        }
    }
    .filter-wrapper {
        padding-left: 1rem;
        .filter {
            font-size: 0.875rem;
            line-height: 1.5;
            em {
                @apply font-bold not-italic;
            }
            &:hover {
                @apply underline cursor-pointer;
            }
        }
    }
}
.alert-data-table {
    @apply col-span-12;
    .p-toolbox-table::v-deep {
        @apply overflow-hidden rounded-lg;
        .panel-top-wrapper {
            @apply bg-white;
            .p-panel-top {
                margin-top: 1.5rem;
                .extra {
                    @apply flex flex-grow-0 ml-auto;
                    z-index: 5;
                }
                .action-button {
                    @apply bg-white;
                    margin-left: 0.5rem;
                    line-height: 1;
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
            &.filter-urgency {
                margin-left: auto;
                margin-right: 1rem;
            }
        }
    }
    .alert-title {
        @apply text-blue-600;
    }
    .ic_state_duplicated path {
        fill: theme('colors.red.200');
    }
}
.only-desktop {
    @apply inline-block;
}
.only-mobile {
    @apply hidden;
}

@screen tablet {
    .alert-data-table {
        .filter-wrapper {
            @apply overflow-x-auto w-full flex-wrap;

            .filter {
                @apply w-full;
                margin: 0.5rem 0;

                &.filter-assigned {
                    .p-checkbox::v-deep {
                        .text {
                            @apply inline-block;
                            margin-left: 0.375rem;
                        }
                    }
                }
            }
        }

        .only-desktop {
            @apply hidden;
        }

        .only-mobile {
            @apply inline-block;
        }
    }
}
</style>
