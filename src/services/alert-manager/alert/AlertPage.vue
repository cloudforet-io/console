<template>
    <div class="alert-page">
        <p-heading :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')" />
        <div class="content-wrapper grid grid-cols-12 gap-4">
            <new-assigned-alert-list-card class="col-span-12" />
            <assigned-alert-info-panel @select="onSelectAlertState" />
            <alert-data-table :alert-state="alertState"
                              :urgency="urgency"
                              :assigned="assigned"
                              :filters="filters"
                              :manage-disabled="!hasManagePermission"
                              class="grid grid-cols-12 col-span-12 gap-4"
                              @update="onUpdateTable"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PHeading } from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { i18n } from '@/translations';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import AlertDataTable from '@/services/alert-manager/alert/modules/AlertDataTable.vue';
import AssignedAlertInfoPanel from '@/services/alert-manager/alert/modules/AssignedAlertInfoPanel.vue';
import NewAssignedAlertListCard from '@/services/alert-manager/alert/modules/NewAssignedAlertListCard.vue';
import { ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE } from '@/services/alert-manager/lib/config';
import type {
    AlertListPageUrlQuery, AlertListTableFilters,
} from '@/services/alert-manager/type';

export default {
    name: 'AlertPage',
    components: {
        AssignedAlertInfoPanel,
        NewAssignedAlertListCard,
        AlertDataTable,
        PHeading,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            pageTitle: computed(() => i18n.t('MONITORING.ALERT.ALERT_LIST.ALERT')),
            alertState: vm.$route.query.state ?? ALERT_STATE_FILTER.OPEN,
            urgency: vm.$route.query.urgency ?? ALERT_URGENCY.ALL,
            assigned: vm.$route.query.assigned ?? ASSIGNED_STATE.ALL,
            filters: tagQueryHelper.filters,
            hasManagePermission: useManagePermissionState(),
        });

        const replaceAlertListPageUrlQuery = (query: AlertListPageUrlQuery) => {
            vm.$router.replace({
                query: {
                    ...vm.$route.query,
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

        return {
            ...toRefs(state),
            onSelectAlertState,
            onUpdateTable,
        };
    },
};
</script>
