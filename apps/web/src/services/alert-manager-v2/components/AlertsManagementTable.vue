<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    makeDistinctValueHandler,
    makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import {
    PToolboxTable, PButton, PLink, PBadge, PI,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import { ACTION_ICON } from '@cloudforet/mirinae/src/navigation/link/type';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { red } from '@/styles/colors';

import { useAlertStateI18n } from '@/services/alert-manager-v2/composables/alert-state-i18n';
import { useAlertUrgencyI18n } from '@/services/alert-manager-v2/composables/alert-urgency-i18n';
import { alertStateBadgeStyleTypeFormatter } from '@/services/alert-manager-v2/helpers/alert-badge-helper';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';

const { getProperRouteLocation } = useProperRouteLocation();

const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => ([
        { name: 'alert_number', label: 'No' },
        { name: 'title', label: 'Title', width: '20rem' },
        { name: 'state', label: 'State' },
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
            { name: 'state', label: 'State' },
            { name: 'service_id', label: 'Service' },
            { name: 'category', label: 'Category' },
            { name: 'resource.resource_type', label: 'Resource Name' },
        ],
    }]),
    // TODO: API check
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        alert_id: makeDistinctValueHandler('monitoring.Alert', 'alert_id'),
        title: makeDistinctValueHandler('monitoring.Alert', 'title'),
        state: makeEnumValueHandler(ALERT_URGENCY),
        service: makeDistinctValueHandler('monitoring.Alert', 'service_id'),
        category: makeDistinctValueHandler('monitoring.Alert', 'category'),
        'resource.resource_type': makeDistinctValueHandler('monitoring.Alert', 'resource.resource_type'),
    })),
});
const state = reactive({
    loading: false,
    items: [{
        alert_number: 1,
        alert_id: 'temp alert id',
        title: 'temp alert',
        state: 'ENABLED',
        service_id: 'temp id',
        urgency: 'LOW',
        category: 'DISCOVERY',
        resources: 'ecommerce-vm-02/spaceone',
        updated_by: '나다',
        resolved_by: '나다',
        acknowledged: '나다',
    }],

    alertStateLabels: useAlertStateI18n(),
    urgencyLabels: useAlertUrgencyI18n(),
});

const handleClickCreateButton = () => {
    console.log('TODO: handleClickCreateButton');
};
const handleChange = () => {
    console.log('TODO: handleChange');
};
const handleClickSettings = () => {
    console.log('TODO: handleClickSettings');
};
const fetchAlertsList = () => {
    console.log('TODO: fetchAlertsList');
};
const handleExportToExcel = () => {
    console.log('TODO: handleExportToExcel');
};
</script>

<template>
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
            :fields="tableState.fields"
            :items="state.items"
            :key-item-sets="tableState.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"
            settings-visible
            @change="handleChange"
            @click-settings="handleClickSettings"
            @refresh="fetchAlertsList"
            @export="handleExportToExcel"
        >
            <template #toolbox-left>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleClickCreateButton"
                >
                    {{ $t('MONITORING.ALERT.ALERT_LIST.CREATE') }}
                </p-button>
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
