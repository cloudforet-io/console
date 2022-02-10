<template>
    <fragment>
        <h3>Clone an Existing Dashboard</h3>
        <div v-for="dashboardData in existingDashboardData" :key="dashboardData.public_dashboard_id">
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
import { defaultLayoutData } from '@/services/billing/cost-management/cost-dashboard/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { DashboardInfo } from '@/services/billing/cost-management/cost-dashboard/type';
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
                const { results } = await SpaceConnector.client.costAnalysis.dashboard.list();
                state.existingDashboardData = results.map(d => ({
                    custom_layouts: d.custom_layouts,
                    public_dashboard_id: d.public_dashboard_id,
                    default_filter: d.default_filter,
                    default_layout_id: d.default_layout_id,
                    name: d.name,
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
        };
    },
};
</script>
