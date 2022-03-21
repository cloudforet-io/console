<template>
    <div class="alert-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="$t('MONITORING.ALERT.ALERT_LIST.ALERT')" />
        <div class="content-wrapper grid grid-cols-12 gap-4">
            <new-assigned-alert-list-card class="col-span-12" />
            <assigned-alert-info-panel @select="onSelectAlertState" />
            <alert-data-table :alert-state="alertState"
                              :urgency="urgency"
                              :assigned="assigned"
                              :filters="filters"
                              class="grid grid-cols-12 col-span-12 gap-4"
                              @update="onUpdateTable"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';
import { QueryHelper } from '@spaceone/console-core-lib/query';

import NewAssignedAlertListCard from '@/services/alert-manager/alert/modules/NewAssignedAlertListCard.vue';
import AlertDataTable from '@/services/alert-manager/alert/modules/AlertDataTable.vue';
import AssignedAlertInfoPanel from '@/services/alert-manager/alert/modules/AssignedAlertInfoPanel.vue';

import {
    AlertListPageUrlQuery, AlertListTableFilters,
} from '@/services/alert-manager/type';
import { ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE } from '@/services/alert-manager/lib/config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';

export default {
    name: 'AlertPage',
    components: {
        AssignedAlertInfoPanel,
        NewAssignedAlertListCard,
        AlertDataTable,
        PBreadcrumbs,
        PPageTitle,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            pageTitle: computed(() => i18n.t('MONITORING.ALERT.ALERT_LIST.ALERT')),
            alertState: vm.$route.query.state ?? ALERT_STATE_FILTER.OPEN,
            urgency: vm.$route.query.urgency ?? ALERT_URGENCY.ALL,
            assigned: vm.$route.query.assigned ?? ASSIGNED_STATE.ALL,
            filters: tagQueryHelper.filters,
        });

        const routeState = reactive({
            route: [
                { name: 'Alert Manager', path: ALERT_MANAGER_ROUTE._NAME },
                { name: 'Alert' },
            ],
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

        /* init */
        (async () => {
            await Promise.all([
                store.dispatch('resource/project/load'),
                store.dispatch('resource/user/load'),
                store.dispatch('resource/webhook/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            routeState,
            onSelectAlertState,
            onUpdateTable,
        };
    },
};
</script>
