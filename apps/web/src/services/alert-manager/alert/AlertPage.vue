<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import { PHeading } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import AlertDataTable from '@/services/alert-manager/alert/modules/AlertDataTable.vue';
import AssignedAlertInfoPanel from '@/services/alert-manager/alert/modules/AssignedAlertInfoPanel.vue';
import NewAssignedAlertListCard from '@/services/alert-manager/alert/modules/NewAssignedAlertListCard.vue';
import { ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE } from '@/services/alert-manager/lib/config';
import type {
    AlertListPageUrlQuery, AlertListTableFilters,
} from '@/services/alert-manager/type';


const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(route.query.filters as undefined|string|(string|null)[]);
const state = reactive({
    pageTitle: computed(() => t('MONITORING.ALERT.ALERT_LIST.ALERT')),
    alertState: route.query.state ?? ALERT_STATE_FILTER.OPEN,
    urgency: route.query.urgency ?? ALERT_URGENCY.ALL,
    assigned: route.query.assigned ?? ASSIGNED_STATE.ALL,
    filters: tagQueryHelper.filters,
    hasManagePermission: useManagePermissionState(),
});

const replaceAlertListPageUrlQuery = (query: AlertListPageUrlQuery) => {
    router.replace({
        query: {
            ...route.query,
            ...query,
        },
    }).catch(() => {});
};

const onSelectAlertState = (alertState) => {
    state.alertState = alertState;
    state.assigned = ASSIGNED_STATE.ASSIGNED_TO_ME;
    state.urgency = ALERT_URGENCY.ALL;
    replaceAlertListPageUrlQuery({ state: alertState, urgency: state.urgency, assigned: state.assigned });
};

const onUpdateTable = (changed: Partial<AlertListTableFilters>) => {
    const query: AlertListPageUrlQuery = {};
    if (changed.state) {
        state.alertState = changed.state;
        query.state = changed.state;
    }
    if (changed.urgency) {
        state.urgency = changed.urgency;
        query.urgency = changed.urgency;
    }
    if (changed.assigned) {
        state.assigned = changed.assigned;
        query.assigned = changed.assigned;
    }
    if (changed.filters) {
        tagQueryHelper.setFilters(changed.filters);
        query.filters = tagQueryHelper.rawQueryStrings;
    }
    replaceAlertListPageUrlQuery(query);
};

</script>

<template>
    <div class="alert-page">
        <p-heading :title="t('MONITORING.ALERT.ALERT_LIST.ALERT')" />
        <div class="content-wrapper grid grid-cols-12 gap-4">
            <new-assigned-alert-list-card class="col-span-12" />
            <assigned-alert-info-panel @select="onSelectAlertState" />
            <alert-data-table :alert-state="state.alertState"
                              :urgency="state.urgency"
                              :assigned="state.assigned"
                              :filters="state.filters"
                              :manage-disabled="!state.hasManagePermission"
                              class="grid grid-cols-12 col-span-12 gap-4"
                              @update="onUpdateTable"
            />
        </div>
    </div>
</template>
