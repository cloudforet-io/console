<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown, PLink, PBadge, PI, PSelectStatus,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import { ACTION_ICON } from '@cloudforet/mirinae/src/navigation/link/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { red } from '@/styles/colors';

import { getAlertStateI18n, getAlertUrgencyI18n } from '@/services/alert-manager-v2/composables/alert-table-data';
import { ALERT_STATUS_FILTERS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import { alertStateBadgeStyleTypeFormatter } from '@/services/alert-manager-v2/helpers/alert-badge-helper';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager-v2/stores/alert-page-store';
import type { AlertFilterType } from '@/services/alert-manager-v2/types/alert-manager-type';

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const { getProperRouteLocation } = useProperRouteLocation();

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => ([
        { name: 'alert_number', label: 'No' },
        { name: 'title', label: 'Title', width: '20rem' },
        { name: 'state', label: 'Status' },
        { name: 'service_id', label: 'Service' },
        { name: 'urgency', label: 'Urgency' },
        { name: 'category', label: 'Category' },
        { name: 'resources', label: 'Resource', width: '20rem' },
        { name: 'updated_by', label: 'Updated by' },
        { name: 'resolved_by', label: 'Resolved by' },
        { name: 'acknowledged by', label: 'Acknowledged by' },
    ])),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'alert_id', label: 'Alert ID' },
            { name: 'title', label: 'Title' },
            { name: 'state', label: 'Status' },
            { name: 'service_id', label: 'Service' },
            { name: 'category', label: 'Category' },
            { name: 'resource.resource_type', label: 'Resource Name' },
        ],
    }]),
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        alert_id: makeDistinctValueHandler('alertManager.Alert', 'alert_id'),
        title: makeDistinctValueHandler('alertManager.Alert', 'title'),
        state: makeEnumValueHandler(ALERT_URGENCY),
        service: makeDistinctValueHandler('alertManager.Alert', 'service_id'),
        category: makeDistinctValueHandler('alertManager.Alert', 'category'),
        'resource.resource_type': makeDistinctValueHandler('alertManager.Alert', 'resource.resource_type'),
    })),
});
const storeState = reactive({
    serviceList: computed<ServiceModel[]>(() => alertPageState.serviceList),
});
const state = reactive({
    loading: false,
    alertList: [] as AlertModel[],
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
});
const filterState = reactive({
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => storeState.serviceList.map((i) => ({
        name: i.service_id,
        label: i.name,
    }))),
    selectedServiceId: '',
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.OPEN'), name: ALERT_STATUS_FILTERS.OPEN },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS_FILTERS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS_FILTERS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS_FILTERS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ERROR'), name: ALERT_STATUS_FILTERS.ERROR },
    ])),
    selectedStatusFilter: 'ALL',
    urgencyFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'), name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW'), name: ALERT_URGENCY.LOW },
    ])),
    selectedUrgencyFilter: 'ALL',
});

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
const handleChange = () => {
    console.log('TODO: handleChange');
};
const handleClickSettings = () => {
    console.log('TODO: handleClickSettings');
};
const handleExportToExcel = () => {
    console.log('TODO: handleExportToExcel');
};

const alertListApiQuery = new ApiQueryHelper().setSort('created_at', true);
const fetchAlertsList = async () => {
    try {
        let stateFilter: ConsoleFilter[] = [];
        if (filterState.selectedStatusFilter !== 'ALL' && filterState.selectedStatusFilter !== ALERT_STATUS_FILTERS.OPEN) {
            stateFilter = [{ k: 'state', v: filterState.selectedStatusFilter, o: '=' }];
        }
        let urgencyFilter: ConsoleFilter[] = [];
        if (filterState.selectedUrgencyFilter !== 'ALL') {
            urgencyFilter = [{ k: 'urgency', v: filterState.selectedUrgencyFilter, o: '=' }];
        }
        alertListApiQuery.setFilters([
            ...stateFilter,
            ...urgencyFilter,
            { k: 'service_id', v: filterState.selectedServiceId, o: '=' },
        ]);
        if (filterState.selectedStatusFilter === ALERT_STATUS_FILTERS.OPEN) {
            alertListApiQuery.setOrFilters([
                { k: 'state', v: ALERT_STATUS_FILTERS.ACKNOWLEDGED, o: '=' },
                { k: 'state', v: ALERT_STATUS_FILTERS.TRIGGERED, o: '=' },
            ]);
        } else {
            alertListApiQuery.setOrFilters([]);
        }
        state.alertList = await alertPageStore.fetchAlertsList({
            query: alertListApiQuery.data,
        });
    } catch (e) {
        ErrorHandler.handleError(e, true);
        state.alertList = [];
    }
};

onMounted(async () => {
    try {
        state.loading = true;
        await alertPageStore.fetchServiceList();
        await fetchAlertsList();
    } finally {
        state.loading = false;
    }
});
</script>

<template>
    <div class="alert-data-table">
        <p-toolbox-table searchable
                         selectable
                         sortable
                         exportable
                         search-type="query"
                         sort-by="created_at"
                         :sort-desc="true"
                         :loading="state.loading"
                         :fields="tableState.fields"
                         :items="state.alertList"
                         :key-item-sets="tableState.keyItemSets"
                         :value-handler-map="tableState.valueHandlerMap"
                         settings-visible
                         @change="handleChange"
                         @click-settings="handleClickSettings"
                         @refresh="fetchAlertsList"
                         @export="handleExportToExcel"
        >
            <template #toolbox-top>
                <p-select-dropdown :menu="filterState.serviceDropdownList"
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
                         badge-type="'subtle'"
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
            <template #col-service_id-format="{ value }">
                <template v-if="value">
                    <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                            new-tab
                            :to="getProperRouteLocation(referenceRouter(value,{ resource_type: 'identity.Project' }))"
                    >
                        {{ value }}
                    </p-link>
                </template>
            </template>
        </p-toolbox-table>
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
