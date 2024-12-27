<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown, PLink, PBadge, PI, PSelectStatus,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import { ACTION_ICON } from '@cloudforet/mirinae/src/navigation/link/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { red } from '@/styles/colors';

import {
    alertStateBadgeStyleTypeFormatter,
    getAlertStateI18n,
    getAlertUrgencyI18n,
} from '@/services/alert-manager-v2/composables/alert-table-data';
import {
    ALERT_EXCEL_FIELDS,
    ALERT_MANAGEMENT_TABLE_FIELDS,
    ALERT_MANAGEMENT_TABLE_HANDLER,
    ALERT_STATUS_FILTERS,
} from '@/services/alert-manager-v2/constants/alert-table-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager-v2/stores/alert-page-store';
import type { AlertFilterType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface AlertItem extends AlertModel {
    alert_number: string;
}

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;
const alertPageGetters = alertPageStore.getters;
const userStore = useUserStore();
const userState = userStore.state;

const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageGetters.serviceDropdownList),
    alertList: computed<AlertModel[]>(() => alertPageState.alertList),
    timezone: computed<string>(() => userState.timezone || ''),
});
const state = reactive({
    loading: false,
    visibleCustomFieldModal: false,

    refinedAlertList: computed<AlertItem[]>(() => storeState.alertList.map((alert) => ({
        ...alert,
        alert_number: alert.alert_id.split('-')[2],
    }))),
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
    fields: ALERT_MANAGEMENT_TABLE_FIELDS,
});
const filterState = reactive({
    selectedServiceId: '',
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.OPEN'), name: ALERT_STATUS_FILTERS.OPEN },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS_FILTERS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS_FILTERS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS_FILTERS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ERROR'), name: ALERT_STATUS_FILTERS.ERROR },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
    ])),
    selectedStatusFilter: 'OPEN',
    urgencyFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'), name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW'), name: ALERT_URGENCY.LOW },
    ])),
    selectedUrgencyFilter: 'ALL',
});

const alertListApiQueryHelper = new ApiQueryHelper()
    .setSort('created_at', true);

const filterQueryHelper = new QueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const getServiceName = (id: string): TranslateResult => {
    if (storeState.serviceDropdownList.length === 0) return '';
    return storeState.serviceDropdownList.find((i) => i.name === id)?.label || '';
};
const handleSelectServiceDropdownItem = (id: string) => {
    filterState.selectedServiceId = id;
    fetchAlertsList();
};
const handleSelectFilter = (type: 'status' | 'urgency', value: string) => {
    if (type === 'status') {
        filterState.selectedStatusFilter = value;
    } else {
        filterState.selectedUrgencyFilter = value;
    }
    fetchAlertsList();
};
const handleChange = async (options: any = {}) => {
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) alertListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) alertListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchAlertsList();
};
const handleClickSettings = () => {
    state.visibleCustomFieldModal = true;
};
const handleVisibleCustomFieldModal = (visible) => {
    state.visibleCustomFieldModal = visible;
};
const handleCustomFieldUpdate = (fields: DataTableFieldType[]) => {
    state.fields = fields;
};
const handleExportToExcel = async () => {
    await downloadExcel({
        url: '/alertManager/alert/list',
        param: {
            query: { ...alertListApiQueryHelper.data, only: ALERT_EXCEL_FIELDS.map((d) => d.key) },
        },
        fields: ALERT_EXCEL_FIELDS,
        file_name_prefix: FILE_NAME_PREFIX.alert,
        timezone: storeState.timezone,
    });
};

const fetchAlertsList = async () => {
    try {
        filterQueryHelper.setFilters([]);
        if (filterState.selectedStatusFilter === ALERT_STATUS_FILTERS.OPEN) {
            filterQueryHelper.addFilter({ k: 'state', v: [ALERT_STATUS_FILTERS.TRIGGERED, ALERT_STATUS_FILTERS.ACKNOWLEDGED], o: '=' });
        } else if (filterState.selectedStatusFilter !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'state', v: filterState.selectedStatusFilter, o: '=' });
        }
        if (filterState.selectedUrgencyFilter !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'urgency', v: filterState.selectedUrgencyFilter, o: '=' });
        }
        if (filterState.selectedServiceId) {
            filterQueryHelper.addFilter({ k: 'service_id', v: filterState.selectedServiceId, o: '=' });
        }

        alertListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
            ...filterQueryHelper.filters,
        ]);

        const params = {
            query: alertListApiQueryHelper.data,
        };
        await alertPageStore.setAlertListParams(params);
        await alertPageStore.fetchAlertsList(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

onMounted(async () => {
    try {
        state.loading = true;
        await fetchAlertsList();
    } finally {
        state.loading = false;
    }
});
</script>

<template>
    <div class="alert-data-table">
        <p-toolbox-table searchable
                         sortable
                         exportable
                         search-type="query"
                         sort-by="created_at"
                         :sort-desc="true"
                         :query-tags="queryTags"
                         :loading="state.loading"
                         :fields="state.fields"
                         :items="state.refinedAlertList"
                         :key-item-sets="ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                         :value-handler-map="ALERT_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                         settings-visible
                         @change="handleChange"
                         @click-settings="handleClickSettings"
                         @refresh="fetchAlertsList"
                         @export="handleExportToExcel"
        >
            <template #toolbox-top>
                <p-select-dropdown :menu="storeState.serviceDropdownList"
                                   :selection-label="$t('ALERT_MANAGER.ALERTS.SERVICE')"
                                   style-type="rounded"
                                   use-fixed-menu-style
                                   :selected="filterState.selectedServiceId"
                                   class="service-dropdown pt-6 pl-4"
                                   @select="handleSelectServiceDropdownItem"
                />
            </template>
            <template #toolbox-bottom>
                <div class="flex justify-between mr-4 mb-4 ml-4">
                    <div class="status-filter-wrapper">
                        <span class="mr-2">{{ $t('ALERT_MANAGER.STATUS') }}</span>
                        <p-select-status v-for="(item, idx) in filterState.statusFields"
                                         :key="idx"
                                         :selected="filterState.selectedStatusFilter"
                                         class="mr-2"
                                         :value="item.name"
                                         @change="handleSelectFilter('status', item.name)"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                    <div class="status-filter-wrapper">
                        <span class="mr-2">{{ $t('ALERT_MANAGER.ALERTS.LABEL_URGENCY') }}</span>
                        <p-select-status v-for="(item, idx) in filterState.urgencyFields"
                                         :key="idx"
                                         :selected="filterState.selectedUrgencyFilter"
                                         class="mr-2"
                                         :value="item.name"
                                         @change="handleSelectFilter('urgency', item.name)"
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
                                name: ALERT_MANAGER_ROUTE_V2.ALERTS.DETAIL._NAME,
                                params: { alertId: item.alert_id }
                            }"
                    >
                        <span class="title-link">{{ value }}</span>
                    </p-link>
                </template>
            </template>
            <template #col-state-format="{ value }">
                <p-badge :style-type="alertStateBadgeStyleTypeFormatter(value)"
                         :badge-type="value === ALERT_STATE.TRIGGERED ? 'solid' : 'subtle'"
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
            <template #col-service_id-format="{ value }">
                <template v-if="value">
                    <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                            new-tab
                            highlight
                            :to="getProperRouteLocation({
                                name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL._NAME,
                                params: {
                                    serviceId: value,
                                },
                            })"
                    >
                        {{ getServiceName(value) }}
                    </p-link>
                </template>
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
        </p-toolbox-table>
        <custom-field-modal :visible="state.visibleCustomFieldModal"
                            resource-type="alertManager.alert"
                            :default-field="ALERT_MANAGEMENT_TABLE_FIELDS"
                            @update:visible="handleVisibleCustomFieldModal"
                            @complete="fetchAlertsList"
                            @custom-field-loaded="handleCustomFieldUpdate"
        />
    </div>
</template>

<style scoped lang="postcss">
.alert-data-table {
    .service-dropdown {
        margin-bottom: -0.5rem;
        width: max-content;
    }
    .status-filter-wrapper {
        @apply flex items-center text-label-md text-gray-600;
        gap: 0.5rem;
        margin-top: -0.5rem;
    }
}
</style>
