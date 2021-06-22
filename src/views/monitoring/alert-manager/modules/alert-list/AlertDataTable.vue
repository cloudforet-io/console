<template>
    <div>
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
                :fields="TABLE_FIELDS"
                :items="items"
                :select-index.sync="selectIndex"
                :total-count="totalCount"
                :query-tags="tags"
                :key-item-sets="QUERY_SEARCH_HANDLER.keyItemSets"
                :value-handler-map="QUERY_SEARCH_HANDLER.valueHandlerMap"
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
                                <alert-actions :selected-items="selectedItems" @refresh="getAlerts()" />
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
                    <alert-table-bottom-filters
                        :alert-state="alertState"
                        :urgency="urgency"
                        :assigned="assigned"
                        @update="onUpdateBottomFilters"
                    />
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
                <template #col-created_at-format="{value, field}">
                    <template v-if="field.label === 'Created'">
                        {{ iso8601Formatter(value, timezone) }}
                    </template>
                    <template v-else>
                        {{ alertDurationFormatter(value) }}
                    </template>
                </template>
                <template #col-webhook_id-format="{ value }">
                    {{ value ? webhookFormatter(value) : ' ' }}
                </template>
            </p-toolbox-table>
        </div>
    </div>
</template>
<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { capitalize } from 'lodash';
import dayjs from 'dayjs';
import {
    PToolboxTable,
    PIconTextButton,
    PPanelTop,
    PBadge,
    PI,
    PAnchor,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import {
    durationFormatter, iso8601Formatter, showLoadingMessage,
} from '@/lib/util';
import { makeDistinctValueHandler, makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { FILE_NAME_PREFIX } from '@/lib/type';
import { QueryHelper } from '@/lib/query';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';

import AlertActions from '@/views/monitoring/alert-manager/modules/alert-list/AlertActions.vue';
import AlertTableBottomFilters from '@/views/monitoring/alert-manager/modules/alert-list/AlertTableBottomFilters.vue';

import {
    AlertBottomFilters, AlertListTableFilters,
} from '@/views/monitoring/alert-manager/type';
import { ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE } from '@/views/monitoring/alert-manager/lib/config';


const DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

const TABLE_FIELDS = [
    { name: 'alert_number', label: 'No' },
    { name: 'title', label: 'Title' },
    { name: 'state', label: 'State' },
    { name: 'urgency', label: 'Urgency' },
    { name: 'status_message', label: 'Status Details' },
    { name: 'project_id', label: 'Project' },
    { name: 'created_at', label: 'Created' },
    { name: 'created_at', label: 'Duration', sortable: false },
    { name: 'assignee', label: 'Assigned to' },
    { name: 'webhook_id', label: 'Triggered by' },
];
const EXCEL_FIELDS = [
    { key: 'alert_number', name: 'No' },
    { key: 'title', name: 'Title' },
    { key: 'state', name: 'State' },
    { key: 'urgency', name: 'Urgency' },
    { key: 'status_message', name: 'Status Details' },
    { key: 'project_id', name: 'Project' },
    { key: 'created_at', name: 'Created', type: 'datetime' },
    { key: 'assignee', name: 'Assigned to' },
    { key: 'webhook_id', name: 'Triggered by' },
];
const QUERY_SEARCH_HANDLER = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'title', label: 'Title' },
            { name: 'status_message', label: 'Status Details' },
            { name: 'project_id', label: 'Project' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
            { name: 'webhook_id', label: 'Triggered by' },
        ],
    }] as KeyItemSet[],
    valueHandlerMap: {
        title: makeDistinctValueHandler('monitoring.Alert', 'title'),
        // eslint-disable-next-line camelcase
        status_message: makeDistinctValueHandler('monitoring.Alert', 'status_message'),
        project_id: makeReferenceValueHandler('identity.Project'),
        created_at: makeDistinctValueHandler('monitoring.Alert', 'created_at'),
        // eslint-disable-next-line camelcase
        webhook_id: makeDistinctValueHandler('monitoring.Alert', 'assignee'),
    },
};

export default {
    name: 'AlertDataTable',
    components: {
        AlertTableBottomFilters,
        AlertActions,
        PToolboxTable,
        PIconTextButton,
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
    },
    setup(props, { root, emit }) {
        const tagQueryHelper = new ApiQueryHelper().setFilters(props.filters);

        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            projects: computed(() => store.state.resource.project.items),
            loading: true,
            selectIndex: [] as number[],
            selectedItems: computed(() => state.selectIndex.map(d => state.items[d])),
            items: [] as any,
            totalCount: 0,
            keyItemSets: QUERY_SEARCH_HANDLER.keyItemSets as KeyItemSet[],
            valueHandlerMap: QUERY_SEARCH_HANDLER.valueHandlerMap,
            tags: tagQueryHelper.setKeyItemSets(QUERY_SEARCH_HANDLER.keyItemSets).queryTags,
            webhookNameList: [] as any,
        });

        /* util */
        const badgeStyleTypeFormatter = (alertState) => {
            if (alertState === ALERT_STATE_FILTER.TRIGGERED) return 'red100';
            if (alertState === ALERT_STATE_FILTER.ACKNOWLEDGED) return 'blue200';
            return 'gray200';
        };

        const webhookFormatter = webhookId => state.webhookNameList.find(element => element.webhook_id === webhookId)?.name;

        const alertDurationFormatter = value => durationFormatter(value, dayjs().format(DATE_TIME_FORMAT), state.timezone) || '--';


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
            .setOnly(...TABLE_FIELDS.map(d => d.name), 'alert_id')
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
                state.totalCount = 0;
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const getWebhooks = async () => {
            const { results } = await SpaceConnector.client.monitoring.webhook.list({
                query: { only: ['webhook_id', 'name'] },
            });
            state.webhookNameList = results;
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
            try {
                await store.dispatch('file/downloadExcel', {
                    url: '/monitoring/alert/list',
                    param: {
                        query: alertApiQuery,
                    },
                    fields: EXCEL_FIELDS,
                    // eslint-disable-next-line camelcase
                    file_name_prefix: FILE_NAME_PREFIX.alert,
                });
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);
            } catch (e) {
                console.error(e);
            }
        };

        const onUpdateBottomFilters = async (filters: AlertBottomFilters) => {
            state.thisPage = 1;
            updateBottomFilterQuery(filters);
            emitUpdate(filters);
            await getAlerts();
        };


        (async () => {
            updateBottomFilterQuery({
                state: props.alertState,
                urgency: props.urgency,
                assigned: props.assigned,
            });
            await Promise.all([getAlerts(), getWebhooks()]);
        })();

        return {
            ...toRefs(state),
            TABLE_FIELDS,
            EXCEL_FIELDS,
            QUERY_SEARCH_HANDLER,
            ALERT_URGENCY,
            ALERT_STATE_FILTER,
            MONITORING_ROUTE,
            ASSIGNED_STATE,
            referenceRouter,
            capitalize,
            webhookFormatter,
            badgeStyleTypeFormatter,
            getAlerts,
            onChange,
            onExportToExcel,
            onUpdateBottomFilters,
            iso8601Formatter,
            alertDurationFormatter,
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
</style>
