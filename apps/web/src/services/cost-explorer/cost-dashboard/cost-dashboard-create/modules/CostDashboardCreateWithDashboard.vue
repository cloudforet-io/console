<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PAnchor, PSelectCard, PDivider, PTextPagination,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { getUUID } from '@/lib/component-util/getUUID';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type {
    DashboardInfo,
    PublicDashboardInfo,
    UserDashboardInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import { convertFiltersInToNewType } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';


const PAGE_SIZE = 8;

const { t } = useI18n();
const store = useStore();

const costDashboardPageStore = useCostDashboardPageStore();
const costDashboardPageState = costDashboardPageStore.$state;

const state = reactive({
    existingDashboardData: [] as Partial<DashboardInfo>[],
    slicedDashboardData: computed<Partial<DashboardInfo>[]>(() => {
        const startIndex = (state.thisPage * PAGE_SIZE) - PAGE_SIZE;
        const endIndex = state.thisPage * PAGE_SIZE;
        return state.existingDashboardData.slice(startIndex, endIndex);
    }),
    // pagination
    totalCount: 0,
    allPage: computed(() => Math.ceil(state.totalCount / PAGE_SIZE) || 1),
    thisPage: 1,
    userId: computed(() => store.state.user.userId),
});

const handleDashboardChange = (value: PublicDashboardInfo) => {
    costDashboardPageStore.$patch((_state) => {
        _state.selectedTemplate = value;
        _state.defaultFilter = convertFiltersInToNewType(value.default_filter ?? {});
    });
};

const listDashboard = async () => {
    try {
        const publicDashboardList = await SpaceConnector.client.costAnalysis.publicDashboard.list();
        const userDashboardList = await SpaceConnector.client.costAnalysis.userDashboard.list({
            user_id: state.userId,
        });
        const dashboardList = [...publicDashboardList.results as PublicDashboardInfo[], ...userDashboardList.results as UserDashboardInfo[]];
        state.existingDashboardData = dashboardList.map((d) => ({
            ...d,
            custom_layouts: d.custom_layouts,
            default_filter: d.default_filter,
            default_layout_id: d.default_layout_id,
            name: d.name,
        }) as Partial<DashboardInfo>);
        state.totalCount = state.existingDashboardData.length ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.existingDashboardData = [];
    }
};
listDashboard();

</script>

<template>
    <div class="existing-dashboard">
        <p-divider />
        <h3>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.EXISTING_DASHBOARD') }}</h3>
        <div class="dashboard-list">
            <div v-for="(dashboardData, idx) in state.slicedDashboardData"
                 :key="`dashboard-${idx}-${getUUID()}`"
                 class="dashboard-item"
            >
                <!--                TODO:: apply keyboard event below this SelectCard-->
                <p-select-card
                    :selected="costDashboardPageState.selectedTemplate"
                    :value="dashboardData"
                    block
                    @change="handleDashboardChange"
                >
                    {{ dashboardData.name }}
                </p-select-card>
                <p-anchor
                    target="_blank"
                    :to=" { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
                            params: { dashboardId: dashboardData.public_dashboard_id ? dashboardData.public_dashboard_id : dashboardData.user_dashboard_id } }"
                >
                    {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.VIEW') }}
                </p-anchor>
            </div>
        </div>
        <p-text-pagination
            v-model:this-page="state.thisPage"
            :all-page="state.allPage"
            @page-change="listDashboard"
        />
    </div>
</template>

<style lang="postcss" scoped>
.existing-dashboard {
    @apply flex flex-col;
    .p-divider {
        @apply w-full mb-6;
    }
    h3 {
        @apply font-bold mb-3;
        font-size: 0.875rem;
    }
    .dashboard-list {
        @apply grid grid-cols-4 col-gap-2;
        .dashboard-item {
            @apply flex flex-col justify-between row-gap-2 mb-4;

            /* custom design-system component - p-select-card */
            :deep(.p-select-card) {
                @apply flex-grow;
                font-size: 0.875rem;
                .contents {
                    @apply font-bold;
                }
            }
            .p-anchor {
                @apply text-center text-blue-700;
            }
        }
    }
    .text-pagination {
        @apply ml-auto mr-auto;
    }
}
</style>
