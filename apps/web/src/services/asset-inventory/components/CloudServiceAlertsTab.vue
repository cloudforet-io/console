<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PToolboxTable, PSelectStatus, PBadge, PDivider, PLink, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import { ALERT_STATUS, ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { gray, red } from '@/styles/colors';

import {
    alertStatusBadgeStyleTypeFormatter,
    calculateTime, getAlertStateI18n, getAlertUrgencyI18n,
} from '@/services/alert-manager/v2/composables/alert-table-data';
import {
    ALERT_EXCEL_FIELDS,
    ALERT_MANAGEMENT_TABLE_FIELDS, ALERT_MANAGEMENT_TABLE_HANDLER,
    ALERT_STATUS_FILTERS,
} from '@/services/alert-manager/v2/constants/alert-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import type { AlertFilterType } from '@/services/alert-manager/v2/types/alert-manager-type';





interface Props {
    cloudServiceId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    cloudServiceId: '',
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const userStore = useUserStore();
const userState = userStore.state;

const storeState = reactive({
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    timezone: computed<string>(() => userState.timezone || ''),
});
const state = reactive({
    fields: ALERT_MANAGEMENT_TABLE_FIELDS,
    items: [] as AlertModel[],
    refinedItems: computed<AlertModel[]>(() => state.items.map((alert:AlertModel) => ({
        ...alert,
        created_at: iso8601Formatter(alert.created_at, storeState.timezone),
    }))),
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
    loading: true,
    totalCount: 0,
    searchText: '',
    pageLimit: 15,
    pageStart: 1,
    visibleCustomFieldModal: false,
});

const filterState = reactive({
    selectedServiceId: '',
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.OPEN'), name: ALERT_STATUS_FILTERS.OPEN },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS_FILTERS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS_FILTERS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS_FILTERS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'), name: ALERT_STATUS_FILTERS.IGNORED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
    ])),
    selectedStatusFilter: 'OPEN',
    urgencyFields: computed<SelectDropdownMenuItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'), name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW'), name: ALERT_URGENCY.LOW },
    ])),
    selectedUrgencyFilter: 'ALL',
    labelHandler: computed(() => makeDistinctValueHandler('alert_manager.Alert', 'labels')),
    selectedLabels: [] as SelectDropdownMenuItem[],
});


const alertListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;
const getAlertsFilter = ():AlertListParameters => {
    alertListApiQueryHelper.setFilters(queryTagHelper.filters.value);
    if (filterState.selectedStatusFilter === ALERT_STATUS_FILTERS.OPEN) {
        alertListApiQueryHelper.addFilter({ k: 'status', v: [ALERT_STATUS_FILTERS.TRIGGERED, ALERT_STATUS_FILTERS.ACKNOWLEDGED], o: '=' });
    } else if (filterState.selectedStatusFilter !== 'ALL') {
        alertListApiQueryHelper.addFilter({ k: 'status', v: filterState.selectedStatusFilter, o: '=' });
    }
    if (filterState.selectedUrgencyFilter !== 'ALL') {
        alertListApiQueryHelper.addFilter({ k: 'urgency', v: filterState.selectedUrgencyFilter, o: '=' });
    }
    if (filterState.selectedLabels.length > 0) {
        alertListApiQueryHelper.addFilter({ k: 'labels', v: filterState.selectedLabels.map((i) => i.name), o: '=' });
    }

    return ({
        query: alertListApiQueryHelper.data,
        asset_id: props.cloudServiceId,
    });
};

const fetchAlerts = async () => {
    state.loading = true;
    const params:AlertListParameters = getAlertsFilter();
    try {
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.alert.list<AlertListParameters, ListResponse<AlertModel>>(params);
        state.items = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};
const getCreatedByNames = (id: string): string => {
    if (id.includes('webhook')) {
        return storeState.webhook[id]?.label || id;
    }
    return id;
};
const handleClickSettings = () => {
    state.visibleCustomFieldModal = true;
};
const handleVisibleCustomFieldModal = (visible:boolean) => {
    state.visibleCustomFieldModal = visible;
};
const handleCustomFieldUpdate = (fields: DataTableFieldType[]) => {
    state.fields = fields;
};

const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) alertListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) alertListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) alertListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchAlerts();
};
const handleRefreshAlertData = async () => {
    await fetchAlerts();
};

const handleSelectFilter = (type: 'status' | 'urgency', value: string) => {
    if (type === 'status') {
        filterState.selectedStatusFilter = value;
    } else {
        filterState.selectedUrgencyFilter = value;
    }
    fetchAlerts();
};

const handleExport = async () => {
    await downloadExcel({
        url: '/alert-manager/alert/list',
        param: {
            query: { ...alertListApiQueryHelper.data, only: ALERT_EXCEL_FIELDS.map((d) => d.key) },
        },
        fields: ALERT_EXCEL_FIELDS,
        file_name_prefix: FILE_NAME_PREFIX.alert,
        timezone: storeState.timezone,
    });
};

watch(() => props.cloudServiceId, (after, before) => {
    if (!after) {
        state.projectUserIdList = [];
    } else if (after !== before) fetchAlerts();
}, { immediate: true });
</script>

<template>
    <div class="alert-data-table">
        <p-heading class="pt-6 px-4"
                   heading-type="sub"
                   use-total-count
                   :title="$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_ALERTS')"
                   :total-count="state.totalCount"
        />
        <p-toolbox-table class="toolbox"
                         searchable
                         sortable
                         exportable
                         search-type="query"
                         sort-by="created_at"
                         :sort-desc="true"
                         :query-tags="queryTags"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :fields="state.fields"
                         :items="state.refinedItems"
                         :key-item-sets="ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                         :value-handler-map="ALERT_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                         settings-visible
                         @change="handleChange"
                         @click-settings="handleClickSettings"
                         @refresh="handleRefreshAlertData"
                         @export="handleExport"
        >
            <template #toolbox-bottom>
                <div class="quick-filter-wrapper flex flex-col mr-4 mb-4 ml-4 gap-2">
                    <div class="status-filter-wrapper">
                        <span class="label">{{ $t('ALERT_MANAGER.STATUS') }}</span>
                        <p-divider class="divider"
                                   vertical
                        />
                        <p-select-status v-for="(item, idx) in filterState.statusFields"
                                         :key="idx"
                                         :selected="filterState.selectedStatusFilter"
                                         :value="item.name"
                                         class="status"
                                         @change="handleSelectFilter('status', item.name)"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                </div>
            </template>
            <template #col-title-format="{ value, item }">
                <template v-if="value">
                    <p-link highlight
                            :to="{
                                name: ALERT_MANAGER_ROUTE.ALERTS.DETAIL._NAME,
                                params: {
                                    alertId: item.alert_id,
                                }
                            }"
                    >
                        <span class="title-link">{{ value }}</span>
                    </p-link>
                </template>
            </template>
            <template #col-status-format="{ value }">
                <p-badge :style-type="alertStatusBadgeStyleTypeFormatter(value)"
                         :badge-type="value === ALERT_STATUS.TRIGGERED ? 'solid' : 'subtle'"
                >
                    {{ state.alertStateLabels[value] }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     class="mr-1"
                     :color="value === ALERT_URGENCY.HIGH ? red[400] : gray[200]"
                />
                <span>{{ state.urgencyLabels[value] }}</span>
            </template>
            <template #col-labels-format="{ value }">
                <div class="flex gap-2">
                    <p-badge v-for="(item, idx) in value?.slice(0, 3)"
                             :key="`labels-${idx}`"
                             badge-type="subtle"
                             style-type="gray200"
                             shape="square"
                             class="label-item"
                    >
                        <span>{{ item }}</span>
                    </p-badge>
                    <p-badge v-if="value?.length > 3"
                             badge-type="subtle"
                             style-type="blue200"
                    >
                        <span>+ {{ value?.length - 3 }}</span>
                    </p-badge>
                </div>
            </template>
            <template #col-triggered_by-format="{ value }">
                <span>{{ getCreatedByNames(value) }}</span>
            </template>
            <template #col-duration-format="{ item }">
                <span>{{ calculateTime(item?.created_at, storeState.timezone) }}</span>
            </template>
        </p-toolbox-table>
        <custom-field-modal :visible="state.visibleCustomFieldModal"
                            resource-type="cloudService.alert"
                            :default-field="ALERT_MANAGEMENT_TABLE_FIELDS"
                            @update:visible="handleVisibleCustomFieldModal"
                            @complete="fetchAlerts"
                            @custom-field-loaded="handleCustomFieldUpdate"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-search-table */
:deep(.p-toolbox-table) {
    border-width: 0;
}

.alert-data-table {
    .toolbox {
        border-radius: 0.375rem;
    }
    .label-item {
        @apply truncate;
        max-width: 9.875rem;
    }
    .quick-filter-wrapper {
        .status-filter-wrapper {
            @apply flex items-center flex-wrap text-label-sm;
            gap: 0.75rem;
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
            .label {
                @apply font-bold;
            }
            .divider {
                height: 1rem;
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
            }
            .status {
                @apply text-label-md;
            }
        }

        @screen mobile {
            gap: 1rem;
            .status-filter-wrapper {
                margin-top: 0;
                .divider {
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
        }
    }
}
</style>
