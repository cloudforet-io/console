<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { PHeading } from '@cloudforet/mirinae';


import { i18n } from '@/translations';

import { queryStringToString } from '@/lib/router-query-string';

import AlertMainDataTable from '@/services/alert-manager/v1/components/AlertMainDataTable.vue';
import {
    ALERT_STATE_FILTER, ALERT_ASSIGNED_FILTER, ALERT_URGENCY_FILTER,
} from '@/services/alert-manager/v1/constants/alert-constant';
import type {
    AlertListPageUrlQuery, AlertListTableFilters,
} from '@/services/alert-manager/v1/types/alert-type';

const router = useRouter();
const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(router.currentRoute.query.filters);

const state = reactive({
    pageTitle: computed(() => i18n.t('MONITORING.ALERT.ALERT_LIST.ALERT')),
    alertState: queryStringToString(router.currentRoute.query.state) ?? ALERT_STATE_FILTER.OPEN,
    urgency: queryStringToString(router.currentRoute.query.urgency) ?? ALERT_URGENCY_FILTER.ALL,
    assigned: queryStringToString(router.currentRoute.query.assigned) ?? ALERT_ASSIGNED_FILTER.ALL,
    filters: tagQueryHelper.filters,
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
        <p-heading class="mb-6"
                   :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')"
        />
        <div class="content-wrapper grid grid-cols-12 gap-4">
            <alert-main-data-table
                :alert-state="state.alertState"
                :urgency="state.urgency"
                :assigned="state.assigned"
                :filters="state.filters"
                class="grid grid-cols-12 col-span-12 gap-4"
                @update="onUpdateTable"
            />
        </div>
    </div>
</template>
