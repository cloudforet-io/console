<template>
    <fragment>
        <p-divider class="w-full mb-6" />
        <div class="flex flex-col">
            <h3>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TEMPLATE.EXISTING_DASHBOARD') }}</h3>
            <div class="grid grid-cols-4 col-gap-2">
                <div v-for="(dashboardData, idx) in existingDashboardData" :key="`$dashboard-${idx}-${getUUID()}`" class="flex flex-col justify-between mb-4">
                    <p-select-card
                        :selected="selectedTemplate"
                        :value="dashboardData"
                        block
                        class="flex-grow"
                        @change="handleDashboardChange"
                    >
                        {{ dashboardData.name }}
                    </p-select-card>
                    <p-anchor
                        target="_blank"
                        :to=" { name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME, params: { dashboardId: dashboardData.public_dashboard_id } }"
                        class="block mt-2 text-center"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TEMPLATE.VIEW') }}
                    </p-anchor>
                </div>
            </div>
            <p-pagination :total-count="totalCount"
                          :this-page.sync="thisPage"
                          :page-size.sync="pageSize"
                          class="ml-auto mr-auto"
            />
        </div>
    </fragment>
</template>

<script lang="ts">
import {
    PAnchor, PSelectCard, PPagination, PDivider,
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
        PPagination,
        PDivider,
    },

    setup() {
        const state = reactive({
            existingDashboardData: [] as Partial<DashboardInfo>[],
            selectedTemplate: computed(() => store.state.service?.costDashboard?.selectedTemplate),
            // pagination
            totalCount: 0,
            thisPage: 1,
            pageSize: 15,
        });

        const handleDashboardChange = (value: Partial<DashboardInfo>) => {
            store.commit('service/costDashboard/setDashboardTemplate', value);
            store.commit('service/costDashboard/setDefaultFilter', value.default_filter);
        };

        const listDashboard = async () => {
            try {
                const publicDashboardList = await SpaceConnector.client.costAnalysis.publicDashboard.list();
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
<style lang="postcss" scoped>
.p-anchor {
    @apply text-blue-600;
    font-size: 0.875rem;
}
</style>
