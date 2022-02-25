<template>
    <div class="existing-dashboard">
        <p-divider />
        <h3>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.EXISTING_DASHBOARD') }}</h3>
        <div class="dashboard-list">
            <div v-for="(dashboardData, idx) in existingDashboardData" :key="`$dashboard-${idx}-${getUUID()}`"
                 class="dashboard-item"
            >
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
                    {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.VIEW') }}
                </p-anchor>
            </div>
        </div>
        <p-text-pagination
            :this-page.sync="thisPage"
            :all-page="allPage"
            @pageChange="listDashboard"
        />
    </div>
</template>

<script lang="ts">
import {
    PAnchor, PSelectCard, PDivider, PTextPagination,
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
// import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
// import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';


const PAGE_SIZE = 1;

export default {
    name: 'CostDashboardCreateWithDashboard',
    components: {
        PSelectCard,
        PAnchor,
        PTextPagination,
        PDivider,
    },

    setup() {
        const state = reactive({
            existingDashboardData: [] as Partial<DashboardInfo>[],
            selectedTemplate: computed(() => store.state.service?.costDashboard?.selectedTemplate),
            // pagination
            totalCount: 0,
            allPage: computed(() => Math.ceil(state.totalCount / PAGE_SIZE) || 1),
            thisPage: 1,
        });

        const handleDashboardChange = (value: Partial<DashboardInfo>) => {
            store.commit('service/costDashboard/setDashboardTemplate', value);
            store.commit('service/costDashboard/setDefaultFilter', value.default_filter);
        };

        // const apiQueryHelper = new ApiQueryHelper();
        // const getParams = () => {
        //     apiQueryHelper.setPageStart(getPageStart(state.thisPage, PAGE_SIZE))
        //         .setPageLimit(PAGE_SIZE);
        //     return {
        //         query: apiQueryHelper.data,
        //     };
        // };
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
            listDashboard,
        };
    },
};
</script>
<style lang="postcss" scoped>
.existing-dashboard {
    @apply flex flex-col;
    .p-divider {
        @apply w-full mb-6;
    }
    .dashboard-list {
        .dashboard-item {
            @apply flex flex-col justify-between row-gap-2 mb-4;
            .p-select-card {
                @apply flex-grow;
            }
            .p-anchor {
                @apply text-center text-blue-700;
                font-size: 0.875rem;
            }
        }
    }
    .text-pagination {
        @apply ml-auto mr-auto;
    }
}
</style>
