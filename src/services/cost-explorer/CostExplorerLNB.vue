<template>
    <aside class="sidebar-menu">
        <l-n-b header="Cost Explorer"
               :top-title="{ label: 'Dashboard', visibleAddButton: true }"
               :menu-set="menuSet"
        />
    </aside>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { SpaceRouter } from '@/router';
import {
    PublicDashboardInfo, UserDashboardInfo,
} from '@/services/cost-explorer/cost-dashboard/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { costExplorerStore } from '@/services/cost-explorer/store';
import { LNBItem } from '@/common/modules/navigations/lnb/type';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { MENU_ID } from '@/lib/router/type';

export default {
    name: 'CostExplorerLNB',
    components: {
        LNB,
    },
    setup() {
        const state = reactive({
            publicDashboardList: computed<PublicDashboardInfo[]>(() => costExplorerStore.state.publicDashboardList ?? []),
            userDashboardList: computed<UserDashboardInfo[]>(() => costExplorerStore.state.userDashboardList ?? []),
            loading: true,
            menuSet: computed<LNBItem[][]>(() => [
                [
                    {
                        type: 'title', label: 'Public', id: 'public', foldable: false,
                    },
                    ...state.publicDashboardList.map((list: PublicDashboardInfo) => ({
                        type: 'item',
                        label: list.name,
                        id: list.public_dashboard_id,
                        to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: list.public_dashboard_id } },
                        hideFavorite: true,
                    })),
                ],
                [
                    {
                        type: 'title', label: 'My Dashboard', id: 'my', foldable: true,
                    },
                    ...state.userDashboardList.map((list: UserDashboardInfo) => ({
                        type: 'item',
                        label: list.name,
                        id: list.name,
                        to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME, params: { dashboardId: list.user_dashboard_id } },
                        hideFavorite: true,
                    })),
                    { type: 'divider' },
                ],
                [
                    {
                        type: 'item', id: MENU_ID.COST_EXPLORER_COST_ANALYSIS, label: 'Cost Analysis', to: { name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME },
                    },
                    {
                        type: 'item', id: MENU_ID.COST_EXPLORER_BUDGET, label: 'Budget', to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME },
                    },
                ],
            ]),
            selectedMenu: {} as LNBItem,
        });

        const listDashboard = async () => {
            try {
                state.loading = true;
                await costExplorerStore.dispatch('setDashboardList');
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        const handleClickCreate = () => {
            SpaceRouter.router.push({
                name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME,
            });
        };

        /* Init */
        (async () => {
            await listDashboard();
        })();


        return {
            ...toRefs(state),
            handleClickCreate,
        };
    },
};
</script>
