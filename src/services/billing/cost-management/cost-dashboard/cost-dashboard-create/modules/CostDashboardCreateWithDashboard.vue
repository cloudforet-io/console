<template>
    <fragment>
        <h3>Clone an Existing Dashboard</h3>
        <div v-for="(dashboardData, idx) in existingDashboardData" :key="`$dashboard-${idx}-${getUUID()}`">
            <p-select-card
                :selected="selectedTemplate"
                :value="dashboardData"
                block
                @change="handleDashboardChange"
            >
                {{ dashboardData.name }}
            </p-select-card>
            <p-anchor
                target="_blank"
                :to=" { name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME, params: { dashboardId: dashboardData.public_dashboard_id } }"
            >
                View
            </p-anchor>
        </div>
    </fragment>
</template>

<script lang="ts">
import {
    PAnchor, PSelectCard,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { getUUID } from '@/lib/component-util/getUUID';
import { defaultLayoutData } from '@/services/billing/cost-management/cost-dashboard/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import {
    DashboardInfo,
    PublicDashboardInfo,
    UserDashboardInfo,
} from '@/services/billing/cost-management/cost-dashboard/type';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { store } from '@/store';

export default {
    name: 'CostDashboardCreateWithDashboard',
    components: {
        PSelectCard,
        PAnchor,
    },

    setup() {
        const state = reactive({
            existingDashboardData: [] as Partial<DashboardInfo>[],
            selectedTemplate: computed(() => store.state.service?.costDashboardCreate?.selectedTemplate),
        });

        const handleDashboardChange = (value: Partial<DashboardInfo>) => {
            store.commit('service/costDashboardCreate/setDashboardTemplate', value);
            store.commit('service/costDashboardCreate/setDefaultFilter', value.default_filter);
        };

        const listDashboard = async () => {
            try {
                const publicDashboardList = await SpaceConnector.client.costAnalysis.dashboard.list();
                const userDashboardList = await SpaceConnector.client.costAnalysis.userDashboard.list();
                const dashboardList = [...publicDashboardList.results as PublicDashboardInfo[], ...userDashboardList.results as UserDashboardInfo[]];
                state.existingDashboardData = dashboardList.map(d => ({
                    custom_layouts: d.custom_layouts,
                    default_filter: d.default_filter,
                    default_layout_id: d.default_layout_id,
                    name: d.name,
                    ...d,
                }) as Partial<DashboardInfo>);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.existingDashboardData = [];
            }
        };
        listDashboard();

        return {
            BILLING_ROUTE,
            ...toRefs(state),
            defaultLayoutData,
            handleDashboardChange,
            getUUID,
        };
    },
};
</script>
