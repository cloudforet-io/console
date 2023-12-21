<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeading } from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { i18n } from '@/translations';

import { queryStringToString } from '@/lib/router-query-string';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import AlertMainDataTable from '@/services/alert-manager/components/AlertMainDataTable.vue';
import {
    ALERT_STATE_FILTER, ASSIGNED_STATE, EXTENDED_ALERT_URGENCY,
} from '@/services/alert-manager/constants/alert-constant';
import type {
    AlertListPageUrlQuery, AlertListTableFilters,
} from '@/services/alert-manager/types/alert-type';

const router = useRouter();
const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(router.currentRoute.query.filters);

const state = reactive({
    pageTitle: computed(() => i18n.t('MONITORING.ALERT.ALERT_LIST.ALERT')),
    alertState: queryStringToString(router.currentRoute.query.state) ?? ALERT_STATE_FILTER.OPEN,
    urgency: queryStringToString(router.currentRoute.query.urgency) ?? EXTENDED_ALERT_URGENCY.ALL,
    assigned: queryStringToString(router.currentRoute.query.assigned) ?? ASSIGNED_STATE.ALL,
    filters: tagQueryHelper.filters,
    hasManagePermission: useManagePermissionState(),
});

const replaceAlertListPageUrlQuery = (query: AlertListPageUrlQuery) => {
    router.replace({
        query: {
            ...router.currentRoute.query,
            ...query,
        },
    }).catch(() => {});
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
        <p-heading :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')" />
        <div class="content-wrapper grid grid-cols-12 gap-4">
            <alert-main-data-table
                :alert-state="state.alertState"
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
